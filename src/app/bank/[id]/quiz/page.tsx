import { prisma } from "@/lib/prisma";
import QuizRunner from "@/components/QuizRunner";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CustomSessionUser {
  id: string;
}

interface QuizQuestionData {
  id: string;
  questionText: string;
  options: string[];
  answers: string[];
}

// Algoritmo puro de mezcla Fisher-Yates (Fuertemente Tipado)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled: T[] = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId: string | undefined = (
    session?.user as CustomSessionUser | undefined
  )?.id;

  if (!currentUserId) {
    return redirect("/");
  }

  // Consulta relacional estricta optimizada mediante select selectivo
  const bank = await prisma.bank.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      isPublic: true,
      allowReviews: true,
      maxAttempts: true,
      allowRevealKey: true,
      timeLimit: true,
      userId: true,
      questions: {
        select: {
          id: true,
          questionText: true,
          options: true,
          answers: true,
        },
      },
    },
  });

  if (!bank) return notFound();

  const attemptCount = await prisma.attempt.count({
    where: { bankId: id, userId: currentUserId },
  });

  if (bank.maxAttempts > 0 && attemptCount >= bank.maxAttempts) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center font-sans gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md w-full shadow-sm space-y-4">
          <span className="text-[10px] font-bold font-mono tracking-widest text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
            Acceso Bloqueado
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2">
            Límite de intentos alcanzado
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Has utilizado todos los intentos disponibles para este banco de
            preguntas ({bank.maxAttempts} de {bank.maxAttempts}).
          </p>
          <Link
            href={`/bank/${bank.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 px-4 py-2 rounded hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al banco
          </Link>
        </div>
      </div>
    );
  }
  
  // Control de Acceso del Lado del Servidor (Cierre de seguridad estricto)
  const isOwner = bank.userId === currentUserId;
  if (!bank.isPublic && !isOwner) {
    return redirect("/");
  }

  // Validación semántica de registros existentes
  if (bank.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <h1 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
          ¡Ups! Banco vacío
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Necesitas agregar preguntas antes de poder iniciar una sesión práctica
          de simulación.
        </p>
        <Link
          href={`/bank/${bank.id}`}
          className="text-xs font-bold uppercase tracking-wider text-blue-950 hover:text-blue-800 underline"
        >
          Volver a agregar preguntas
        </Link>
      </div>
    );
  }

  // Mezcla y segmentación de datos limitada a 60 reactivos
  const shuffledQuestions: QuizQuestionData[] = shuffleArray<QuizQuestionData>(
    bank.questions,
  );
  const selectedQuestions: QuizQuestionData[] = shuffledQuestions.slice(0, 60);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href={`/bank/${bank.id}`}
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} className="mr-1.5" /> Salir del examen
        </Link>
      </div>

      {/* Inyección de los parámetros de negocio tipados al componente de UI */}
      <QuizRunner
        questions={selectedQuestions}
        bankId={bank.id}
        allowReviews={bank.allowReviews}
        maxAttempts={bank.maxAttempts}
        allowRevealKey={bank.allowRevealKey}
        timeLimit={bank.timeLimit}
      />
    </div>
  );
}
