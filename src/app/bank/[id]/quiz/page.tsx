// app/bank/[id]/quiz/page.tsx
import { prisma } from "@/lib/prisma";
import QuizRunner from "@/components/QuizRunner";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

// Utility function to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function QuizPage({ params }: PageProps) {
  // Fix para Next 15 (si usas Next 14 quita el await)
  const { id } = await params;

  // 1. Obtenemos el banco con TODAS sus preguntas
  const bank = await prisma.bank.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  });

  if (!bank) notFound();

  // Validación si está vacío
  if (bank.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold mb-4">¡Ups! Banco vacío</h1>
        <p className="text-gray-500 mb-8">
          Necesitas agregar preguntas antes de practicar.
        </p>
        <Link
          href={`/bank/${bank.id}`}
          className="text-indigo-600 hover:underline"
        >
          Volver a agregar preguntas
        </Link>
      </div>
    );
  }

  // 2. ALGORITMO DE MEZCLA (Fisher-Yates Shuffle)
  // Esto desordena el array de forma eficiente y justa
  const shuffledQuestions = shuffleArray(bank.questions);

  // 3. RECORTAMOS A MÁXIMO 60
  // Si hay menos de 60, .slice() simplemente devuelve todas las que haya.
  const selectedQuestions = shuffledQuestions.slice(0, 60);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href={`/bank/${bank.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Salir del examen
        </Link>
      </div>

      {/* Le pasamos al Runner solo las 60 (o menos) preguntas ya desordenadas */}
      <QuizRunner questions={selectedQuestions} bankId={bank.id} />
    </div>
  );
}
