"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addQuestion(formData: FormData) {
  const bankId = formData.get("bankId") as string;
  const question = formData.get("question") as string;
  
  // Obtenemos todas las opciones escritas
  const options = formData.getAll("options") as string[];
  // Obtenemos los índices de las respuestas correctas seleccionadas
  const correctIndices = formData.getAll("correctIndices").map(Number);

  if (!question || !bankId || correctIndices.length === 0 || options.length < 2) {
    return;
  }

  // Mapeamos los índices a los textos reales de las respuestas
  // Ej: Indices [0, 2] -> ["Opción A", "Opción C"]
  const correctAnswers = correctIndices.map(index => options[index]);

  const validOptions = options.filter(opt => opt.trim() !== "");

  await prisma.question.create({
    data: {
      questionText: question,
      answers: correctAnswers,
      options: validOptions,
      bankId: bankId,
    },
  });

  revalidatePath(`/bank/${bankId}`);
}