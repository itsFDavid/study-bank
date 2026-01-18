import { prisma } from "@/lib/prisma";
import FlashCard from "@/components/FlashCard";
import CreateQuestionForm from "@/components/CreateQuestionForm";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
  searchParams: { page?: string }; // Añadimos searchParams para la paginación
}

export default async function BankPage({ params, searchParams }: PageProps) {
  // 1. Manejo de parámetros asíncronos (Next.js moderno)
  const { id } = await params;
  const { page } = await searchParams;

  // 2. Configuración de paginación
  const currentPage = Number(page) || 1;
  const PAGE_SIZE = 10; // Cantidad de preguntas por página
  const skip = (currentPage - 1) * PAGE_SIZE;

  // 3. Consultas a la base de datos en paralelo (Datos del banco + Preguntas paginadas + Conteo total)
  const [bank, totalQuestions] = await Promise.all([
    prisma.bank.findUnique({
      where: { id },
      include: {
        questions: {
          take: PAGE_SIZE,
          skip: skip,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.question.count({
      where: { bankId: id },
    }),
  ]);

  if (!bank) notFound();

  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-32">
      {/* HEADER DECORATIVO SUPERIOR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="Volver"
              >
                <ArrowLeft size={20} />
              </Link>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Layers size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-none">
                    {bank.title}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {totalQuestions} preguntas en total
                  </p>
                </div>
              </div>
            </div>

            {/* BOTÓN MODO EXAMEN */}
            {totalQuestions > 0 && (
              <Link
                href={`/bank/${bank.id}/quiz`}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} />
                Practicar Ahora
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-10">
        {/* SECCIÓN 1: FORMULARIO DE CREACIÓN (RECTÁNGULO SUPERIOR) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Añadir nueva pregunta
            </h2>
            <p className="text-sm text-gray-500">
              Crea una tarjeta de estudio para este banco.
            </p>
          </div>
          {/* Aquí renderizamos tu formulario existente, asegurando que ocupe el ancho disponible */}
          <CreateQuestionForm bankId={bank.id} />
        </section>

        {/* SECCIÓN 2: LISTADO DE PREGUNTAS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-lg font-bold text-gray-700">
              Banco de Preguntas
              <span className="ml-2 text-sm font-normal text-gray-400">
                (Página {currentPage} de {totalPages || 1})
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {bank.questions.length > 0 ? (
              bank.questions.map((q, index) => (
                <div key={q.id} className="relative group">
                  {/* Número de pregunta discreto a la izquierda (opcional) */}
                  <div className="absolute -left-8 top-6 text-xs text-gray-300 font-bold hidden md:block">
                    #{totalQuestions - (skip + index)}
                  </div>
                  <FlashCard
                    question={q.questionText}
                    answers={q.answers}
                    options={q.options}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <Layers size={32} />
                </div>
                <h3 className="text-gray-900 font-medium">
                  Aún no hay preguntas
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Utiliza el formulario de arriba para comenzar.
                </p>
              </div>
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalQuestions > 0 && (
            <div className="mt-10 flex justify-center items-center gap-4">
              {hasPrevPage ? (
                <Link
                  href={`/bank/${id}?page=${currentPage - 1}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium"
                >
                  <ChevronLeft size={16} /> Anterior
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 border border-transparent text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}

              <span className="text-sm font-medium text-gray-500">
                {currentPage} / {totalPages}
              </span>

              {hasNextPage ? (
                <Link
                  href={`/bank/${id}?page=${currentPage + 1}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium"
                >
                  Siguiente <ChevronRight size={16} />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 border border-transparent text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
