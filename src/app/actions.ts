"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod"; // npm install zod

// 1. ESQUEMA DE VALIDACIÓN con Zod
const questionSchema = z.object({
  bankId: z.string().min(1, "Bank ID requerido"),
  question: z
    .string()
    .min(10, "La pregunta debe tener al menos 10 caracteres")
    .max(2000, "La pregunta no puede exceder 2000 caracteres"),
  options: z
    .array(z.string().min(1, "Las opciones no pueden estar vacías"))
    .min(2, "Debe haber al menos 2 opciones")
    .max(10, "No puede haber más de 10 opciones"),
  correctIndices: z
    .array(z.number().int().min(0))
    .min(1, "Debe marcar al menos una respuesta correcta"),
});

const bankSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
});

export async function addQuestion(formData: FormData) {
  try {
    // 2. EXTRACCIÓN DE DATOS
    const bankId = formData.get("bankId") as string;
    const question = formData.get("question") as string;
    const options = formData.getAll("options") as string[];
    const correctIndices = formData
      .getAll("correctIndices")
      .map((idx) => Number(idx));

    // 3. VALIDACIÓN CON ZOD
    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctIndices,
    });

    // 4. VALIDACIÓN ADICIONAL: Los índices deben estar dentro del rango
    const maxIndex = validated.options.length - 1;
    const invalidIndices = validated.correctIndices.filter(
      (idx) => idx < 0 || idx > maxIndex
    );

    if (invalidIndices.length > 0) {
      throw new Error("Índices de respuestas inválidos");
    }

    // 5. VERIFICAR QUE EL BANCO EXISTE (Previene inyección de IDs falsos)
    const bankExists = await prisma.bank.findUnique({
      where: { id: validated.bankId },
      select: { id: true },
    });

    if (!bankExists) {
      throw new Error("Banco no encontrado");
    }

    // 6. SANITIZAR TEXTO (opcional pero recomendado)
    const sanitizedQuestion = validated.question.trim();
    const sanitizedOptions = validated.options.map((opt) => opt.trim());

    // 7. MAPEAR RESPUESTAS CORRECTAS
    const correctAnswers = validated.correctIndices.map(
      (index) => sanitizedOptions[index]
    );

    // 8. LÍMITE DE RATE (Prevenir spam)
    // Opcional: verificar cuántas preguntas se crearon en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentQuestions = await prisma.question.count({
      where: {
        bankId: validated.bankId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentQuestions > 100) {
      throw new Error("Límite de preguntas por hora alcanzado");
    }

    // 9. CREAR PREGUNTA EN TRANSACCIÓN
    await prisma.question.create({
      data: {
        questionText: sanitizedQuestion,
        answers: correctAnswers,
        options: sanitizedOptions,
        bankId: validated.bankId,
      },
    });

    // 10. REVALIDAR
    revalidatePath(`/bank/${validated.bankId}`);

    return { success: true };
  } catch (error) {
    // 11. MANEJO DE ERRORES SEGURO (no exponer detalles internos)
    console.error("Error al crear pregunta:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        details: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteQuestion(questionId: string, bankId: string) {
  try {
    await prisma.question.delete({
      where: { id: questionId },
    });
    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar la pregunta" };
  }
}

export async function updateQuestion(formData: FormData) {
  try {
    const questionId = formData.get("questionId") as string;
    const bankId = formData.get("bankId") as string;
    const question = formData.get("question") as string;
    const options = formData.getAll("options") as string[];
    const correctIndices = formData.getAll("correctIndices").map(Number);

    // Reutilizamos la validación
    const validated = questionSchema.parse({
      bankId,
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctIndices,
    });

    // Mapeo de respuestas
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
    console.error(error);
    return { success: false, error: "Error al actualizar la pregunta" };
  }
}


// --- ACTIONS PARA BANCOS ---

export async function deleteBank(bankId: string) {
  try {
    await prisma.bank.delete({ where: { id: bankId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el banco" };
  }
}

export async function updateBank(bankId: string, formData: FormData) {
  const title = formData.get("title") as string;
  
  const validated = bankSchema.safeParse({ title });
  
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors.title?.[0] || "Datos inválidos" };
  }

  try {
    await prisma.bank.update({
      where: { id: bankId },
      data: { title: validated.data.title },
    });
    revalidatePath("/");
    revalidatePath(`/bank/${bankId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al renombrar el banco" };
  }
}