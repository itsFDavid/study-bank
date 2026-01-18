import { prisma } from "@/lib/prisma";
import QuestionForm from "@/components/QuestionForm";
import QuestionItem from "@/components/QuestionItem";
import DeleteBankButton from "@/components/DeleteBankButton";
import Link from "next/link";
import { ArrowLeft, Play, LayoutGrid, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BankPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const PAGE_SIZE = 10;
  const skip = (currentPage - 1) * PAGE_SIZE;

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
    prisma.question.count({ where: { bankId: id } }),
  ]);

  if (!bank) notFound();
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide truncate max-w-[150px] md:max-w-md">
              {bank.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* CAMBIO 1: Ocultar en móvil (hidden), mostrar en desktop (md:block) */}
            <div className="hidden md:block">
              <DeleteBankButton bankId={bank.id} />
            </div>

            {totalQuestions > 0 && (
              <Link
                href={`/bank/${bank.id}/quiz`}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <Play size={14} fill="currentColor" />
                <span className="hidden sm:inline">Start Examination</span>
                <span className="sm:hidden">Start</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input Form (Sticky) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="sticky top-24 space-y-6">
            {/* Formulario de Crear */}
            <QuestionForm bankId={bank.id} />

            {/* CAMBIO 2: Sección "Danger Zone" visible SOLO en móvil para no perder la función */}
            <div className="md:hidden bg-white rounded-lg border border-rose-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-medium text-sm">
                  <AlertTriangle size={16} />
                  <span>Danger Zone</span>
                </div>
                <DeleteBankButton bankId={bank.id} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Question List */}
        <div className="lg:col-span-8 order-1">
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={18} className="text-slate-400" />
              Item Bank
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Showing {skip + 1}-{Math.min(skip + PAGE_SIZE, totalQuestions)} of{" "}
              {totalQuestions}
            </span>
          </div>

          <div className="space-y-4">
            {bank.questions.length > 0 ? (
              bank.questions.map((q, index) => (
                <div key={q.id}>
                  {/* Usamos QuestionItem que incluye los botones de editar/borrar */}
                  <QuestionItem
                    question={q}
                    bankId={bank.id}
                    index={skip + index}
                    total={totalQuestions}
                  />
                </div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
                <p className="text-slate-500">Repository is empty.</p>
                <p className="text-sm text-slate-400 mt-1">
                  Use the form to define examination items.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="px-3 py-1 bg-white border border-slate-300 text-sm rounded hover:bg-slate-50"
                >
                  Prev
                </Link>
              ) : (
                <span className="px-3 py-1 text-slate-300 border border-slate-100 text-sm rounded">
                  Prev
                </span>
              )}

              <span className="px-3 py-1 text-sm text-slate-600 font-medium">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="px-3 py-1 bg-white border border-slate-300 text-sm rounded hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="px-3 py-1 text-slate-300 border border-slate-100 text-sm rounded">
                  Next
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
