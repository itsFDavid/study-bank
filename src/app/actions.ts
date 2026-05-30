"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// =====================================================
// TIPOS DE RETORNO CONSISTENTES Y TIPADOS
// =====================================================
type ActionSuccess = { 
  success: true; 
};

type ActionError = { 
  success: false; 
  error: string; 
  details?: Record<string, string[] | undefined> | string; 
};

type ActionResult = ActionSuccess | ActionError;

// Extensiones de interfaz para tipar de forma estricta la sesión de NextAuth
interface CustomSessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
}

// =====================================================
// ESQUEMAS DE VALIDACIÓN (ZOD)
// =====================================================
const questionSchema = z.object({
  bankId: z.string().min(1, "Bank ID required"),
  question: z.string().min(10, "Question must be at least 10 characters").max(2000),
  options: z.array(z.string().min(1, "Option content cannot be empty")).min(2).max(10),
  correctIndices: z.array(z.number().int().min(0)).min(1),
});

const bankSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  isPublic: z.boolean().default(false),
  allowReviews: z.boolean().default(true),
  maxAttempts: z.number().int().min(0).default(0),
});

const bankSettingsSchema = z.object({
  isPublic: z.boolean().default(false),
  allowReviews: z.boolean().default(true),
  maxAttempts: z.number().int().min(0).default(0),
});

// Helper interno para validar sesión y propiedad del recurso con tipado estricto
async function getAuthenticatedUser(): Promise<string> {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomSessionUser | undefined;
  
  if (!user || !user.id) {
    throw new Error("UNAUTHORIZED: Debe iniciar sesión con Google para realizar esta acción.");
  }
  return user.id;
}

// Helper para parsear de manera segura y tipada cualquier error en el bloque catch
function handleActionError(error: unknown): ActionError {
  if (error instanceof z.ZodError) {
    const issues = error.issues ?? [];
    const messages = issues
      .map((e) => `${e.path.join(".") || "campo"}: ${e.message}`)
      .join(" · ");
    return {
      success: false,
      error: messages,
      details: error.flatten().fieldErrors,
    };
  }
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Ocurrió un error desconocido en el servidor." };
}

// =====================================================
// QUESTION ACTIONS (PROTEGIDAS Y TIPADAS)
// =====================================================
export async function addQuestion(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUser();
    
    const bankId = formData.get("bankId")?.toString() || "";
    const question = formData.get("question")?.toString() || "";
    const options = formData.getAll("options").map(o => o.toString());
    const correctIndices = formData.getAll("correctIndices").map(idx => Number(idx));

    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter(o => o.trim() !== ""),
      correctIndices,
    });

    // Verificar propiedad: El banco debe pertenecer al usuario logueado
    const bank = await prisma.bank.findUnique({
      where: { id: validated.bankId },
      select: { userId: true },
    });

    if (!bank || bank.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No tienes permisos para añadir preguntas a este banco." };
    }

    const sanitizedOptions = validated.options.map(opt => opt.trim());
    const correctAnswers = validated.correctIndices.map(idx => sanitizedOptions[idx]);

    await prisma.question.create({
      data: {
        questionText: validated.question.trim(),
        answers: correctAnswers,
        options: sanitizedOptions,
        bankId: validated.bankId,
      },
    });

    revalidatePath(`/bank/${validated.bankId}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateQuestion(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUser();
    
    const questionId = formData.get("questionId")?.toString() || "";
    const bankId = formData.get("bankId")?.toString() || "";
    const question = formData.get("question")?.toString() || "";
    const options = formData.getAll("options").map(o => o.toString());
    const correctIndices = formData.getAll("correctIndices").map(idx => Number(idx));

    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter(o => o.trim() !== ""),
      correctIndices,
    });

    // Verificar propiedad cruzada
    const currentQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { bank: { select: { userId: true } } },
    });

    if (!currentQuestion || currentQuestion.bank.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No eres el propietario de este contenido." };
    }

    const sanitizedOptions = validated.options.map(opt => opt.trim());
    const correctAnswers = validated.correctIndices.map(idx => sanitizedOptions[idx]);

    await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: validated.question,
        options: sanitizedOptions,
        answers: correctAnswers,
      },
    });

    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteQuestion(questionId: string, bankId: string): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUser();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { bank: { select: { userId: true } } },
    });

    if (!question || question.bank.userId !== userId) {
      return { success: false, error: "FORBIDDEN: Acción no permitida." };
    }

    await prisma.question.delete({ where: { id: questionId } });
    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

// =====================================================
// BANK ACTIONS (PROTEGIDAS Y TIPADAS)
// =====================================================
export async function deleteBank(bankId: string): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUser();

    const bank = await prisma.bank.findUnique({ where: { id: bankId }, select: { userId: true } });
    if (!bank || bank.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No puedes eliminar este banco." };
    }

    await prisma.bank.delete({ where: { id: bankId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateBank(bankId: string, formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUser();

    const bank = await prisma.bank.findUnique({ where: { id: bankId }, select: { userId: true } });
    if (!bank || bank.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No puedes modificar este banco." };
    }

    const isPublic = formData.get("isPublic") === "true";
    const allowReviews = formData.get("allowReviews") === "true";
    const maxAttempts = Number(formData.get("maxAttempts") || 0);

    const validated = bankSettingsSchema.parse({ isPublic, allowReviews, maxAttempts });

    await prisma.bank.update({
      where: { id: bankId },
      data: {
        isPublic: validated.isPublic,
        allowReviews: validated.allowReviews,
        maxAttempts: validated.maxAttempts,
      },
    });

    revalidatePath("/");
    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating bank:", error);
    return handleActionError(error);
  }
}