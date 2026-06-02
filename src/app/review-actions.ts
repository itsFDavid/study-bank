"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { checkLimit, reviewLimiter } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/get-ip";

// =====================================================
// TIPOS DE RETORNO ESTRICTOS
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

interface CustomSessionUser {
  id: string;
}

// =====================================================
// ESQUEMA DE VALIDACIÓN ESPECÍFICO (ZOD)
// =====================================================
const reviewSchema = z.object({
  bankId: z.string().min(1, "El ID del banco es requerido."),
  rating: z
    .number()
    .min(1.0, "La calificación mínima es de 1 estrella.")
    .max(5.0, "La calificación máxima es de 5 estrellas."),
  comment: z
    .string()
    .min(5, "El comentario o duda debe tener al menos 5 caracteres.")
    .max(1000, "El comentario no puede exceder los 1000 caracteres."),
});

// Helper de seguridad aislado para las reseñas
async function getLoggedUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomSessionUser | undefined;
  
  if (!user || !user.id) {
    throw new Error("UNAUTHORIZED: Los invitados no pueden dejar reseñas. Por favor inicia sesión con Google.");
  }
  return user.id;
}

// =====================================================
// REVIEW SERVER ACTIONS
// =====================================================

/**
 * Registra una nueva calificación y comentario sobre un banco de preguntas público.
 */
export async function submitReview(formData: FormData): Promise<ActionResult> {
  try {
    // 1. Validar autenticación de seguridad
    const userId = await getLoggedUserId();
    const ip = await getClientIp();

    const allowed = await checkLimit(reviewLimiter, `${userId}:${ip}`);
    if (!allowed) {
      return { success: false, error: "Demasiados intentos. Espera antes de enviar otra reseña." };
    }

    // 2. Extraer y parsear tipos primitivos desde el formulario
    const bankId = formData.get("bankId")?.toString() || "";
    const rating = Number(formData.get("rating") || 0);
    const comment = formData.get("comment")?.toString() || "";

    // 3. Validar reglas de negocio con Zod
    const validated = reviewSchema.parse({ bankId, rating, comment });

    // 4. Verificar existencia del banco y si el autor admite retroalimentación
    const bank = await prisma.bank.findUnique({
      where: { id: validated.bankId },
      select: { isPublic: true, allowReviews: true, userId: true },
    });

    if (!bank) {
      return { success: false, error: "NOT_FOUND: El banco de preguntas especificado no existe." };
    }

    if (!bank.isPublic) {
      return { success: false, error: "FORBIDDEN: No se pueden dejar reseñas en un banco de preguntas privado." };
    }

    if (!bank.allowReviews) {
      return { success: false, error: "FORBIDDEN: El autor ha deshabilitado los comentarios para este banco." };
    }

    if (bank.userId === userId) {
      return { success: false, error: "BAD_REQUEST: No puedes calificar ni dejar comentarios en tu propio banco de preguntas." };
    }

    // 5. Evitar duplicados: Un usuario solo puede dejar una reseña por banco (Buenas prácticas)
    const existingReview = await prisma.review.findFirst({
      where: {
        bankId: validated.bankId,
        userId: userId,
      },
    });

    if (existingReview) {
      return { success: false, error: "CONFLICT: Ya has enviado una evaluación para este examen anteriormente." };
    }

    // 6. Inserción atómica en PostgreSQL
    await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment.trim(),
        userId: userId,
        bankId: validated.bankId,
      },
    });

    // 7. Revalidar la caché bajo demanda de Next.js
    revalidatePath(`/bank/${validated.bankId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Error en el formato de la reseña.",
        details: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor al procesar la reseña.",
    };
  }
}

export async function updateReview(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getLoggedUserId();
    const ip = await getClientIp();
    const allowed = await checkLimit(reviewLimiter, `update:${userId}:${ip}`);
    if (!allowed) {
      return { success: false, error: "Demasiados intentos. Espera antes de editar." };
    }

    const reviewId = formData.get("reviewId")?.toString() || "";
    const rating = Number(formData.get("rating") || 0);
    const comment = formData.get("comment")?.toString() || "";

    const validated = z.object({
      rating: z.number().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
      comment: z.string().min(5, "Al menos 5 caracteres").max(1000, "Máximo 1000 caracteres"),
    }).parse({ rating, comment });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, bankId: true },
    });

    if (!review || review.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No puedes editar esta reseña." };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { rating: validated.rating, comment: validated.comment.trim() },
    });

    revalidatePath(`/bank/${review.bankId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = (error.issues ?? [])
        .map((e) => `${e.path.join(".") || "campo"}: ${e.message}`)
        .join(" · ");
      return { success: false, error: messages };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido.",
    };
  }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    const userId = await getLoggedUserId();
    const ip = await getClientIp();
    const allowed = await checkLimit(reviewLimiter, `delete:${userId}:${ip}`);
    if (!allowed) {
      return { success: false, error: "Demasiados intentos." };
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, bankId: true },
    });

    if (!review || review.userId !== userId) {
      return { success: false, error: "FORBIDDEN: No puedes eliminar esta reseña." };
    }

    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath(`/bank/${review.bankId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido.",
    };
  }
}