"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// =====================================================
// TIPOS DE RETORNO CONSISTENTES
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

// =====================================================
// ESQUEMAS DE VALIDACIÓN
// =====================================================

const questionSchema = z.object({
  bankId: z.string().min(1, "Bank ID required"),
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(2000, "Question cannot exceed 2000 characters"),
  options: z
    .array(z.string().min(1, "Options cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options allowed"),
  correctIndices: z
    .array(z.number().int().min(0))
    .min(1, "At least one correct answer required"),
});

const bankSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
});

// =====================================================
// QUESTION ACTIONS
// =====================================================

export async function addQuestion(formData: FormData): Promise<ActionResult> {
  try {
    const bankId = formData.get("bankId") as string;
    const question = formData.get("question") as string;
    const options = formData.getAll("options") as string[];
    const correctIndices = formData
      .getAll("correctIndices")
      .map((idx) => Number(idx));

    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctIndices,
    });

    // Validar índices dentro de rango
    const maxIndex = validated.options.length - 1;
    const invalidIndices = validated.correctIndices.filter(
      (idx) => idx < 0 || idx > maxIndex
    );

    if (invalidIndices.length > 0) {
      return {
        success: false,
        error: "Invalid answer indices",
        details: "Selected indices are out of range",
      };
    }

    // Verificar existencia del banco
    const bankExists = await prisma.bank.findUnique({
      where: { id: validated.bankId },
      select: { id: true },
    });

    if (!bankExists) {
      return {
        success: false,
        error: "Bank not found",
        details: "The specified question bank does not exist",
      };
    }

    // Sanitización
    const sanitizedQuestion = validated.question.trim();
    const sanitizedOptions = validated.options.map((opt) => opt.trim());

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentQuestions = await prisma.question.count({
      where: {
        bankId: validated.bankId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentQuestions > 100) {
      return {
        success: false,
        error: "Rate limit exceeded",
        details: "Maximum 100 questions per hour",
      };
    }

    // Mapear respuestas correctas
    const correctAnswers = validated.correctIndices.map(
      (index) => sanitizedOptions[index]
    );

    // Crear pregunta
    await prisma.question.create({
      data: {
        questionText: sanitizedQuestion,
        answers: correctAnswers,
        options: sanitizedOptions,
        bankId: validated.bankId,
      },
    });

    revalidatePath(`/bank/${validated.bankId}`);
    return { success: true };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid data",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateQuestion(
  formData: FormData
): Promise<ActionResult> {
  try {
    const questionId = formData.get("questionId") as string;
    const bankId = formData.get("bankId") as string;
    const question = formData.get("question") as string;
    const options = formData.getAll("options") as string[];
    const correctIndices = formData.getAll("correctIndices").map(Number);

    if (!questionId) {
      return {
        success: false,
        error: "Question ID required",
      };
    }

    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctIndices,
    });

    const sanitizedOptions = validated.options.map((opt) => opt.trim());
    const correctAnswers = validated.correctIndices.map(
      (index) => sanitizedOptions[index]
    );

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

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid data",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function deleteQuestion(
  questionId: string,
  bankId: string
): Promise<ActionResult> {
  try {
    if (!questionId || !bankId) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Verificar existencia antes de eliminar
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, bankId: true },
    });

    if (!question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    if (question.bankId !== bankId) {
      return {
        success: false,
        error: "Question does not belong to this bank",
      };
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete question",
    };
  }
}

// =====================================================
// BANK ACTIONS
// =====================================================

export async function deleteBank(bankId: string): Promise<ActionResult> {
  try {
    if (!bankId) {
      return {
        success: false,
        error: "Bank ID required",
      };
    }

    await prisma.bank.delete({ where: { id: bankId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete bank",
    };
  }
}

export async function updateBank(
  bankId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string;

    const validated = bankSchema.safeParse({ title });

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.flatten().fieldErrors.title?.[0] || "Invalid data",
      };
    }

    await prisma.bank.update({
      where: { id: bankId },
      data: { title: validated.data.title },
    });

    revalidatePath("/");
    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to rename bank",
    };
  }
}