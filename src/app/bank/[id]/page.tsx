// src/app/bank/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Play, Lock, Clock, Target, Eye } from "lucide-react";
import BankSettingsForm from "@/components/BankSettingsForm";
import ReviewSection from "@/components/ReviewSection";
import QuestionForm from "@/components/QuestionForm";
import QuestionItem from "@/components/QuestionItem";
import BankPagination from "@/components/BankPagination";
import DeleteBankButton from "@/components/DeleteBankButton";

interface BankPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

interface CustomSessionUser {
  id: string;
}

export default async function BankPage({
  params,
  searchParams,
}: BankPageProps) {
  const resolvedParams = await params;
  const resolvedQueryParams = await searchParams;

  const currentPage = Number(resolvedQueryParams.page || "1");
  const currentLimit = Number(resolvedQueryParams.limit || "10");

  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as CustomSessionUser | undefined)?.id;
  const hasSession =
    typeof currentUserId === "string" && currentUserId.length > 0;

  // 1. Obtener la metadata e información del banco de preguntas
  const bankInfo = await prisma.bank.findUnique({
    where: { id: resolvedParams.id },
    include: {
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!bankInfo) return notFound();

  const isOwner = bankInfo.userId === currentUserId;
  if (!bankInfo.isPublic && !isOwner) {
    return redirect("/");
  }

  const userExistingReview = hasSession
    ? await prisma.review.findFirst({
        where: { bankId: resolvedParams.id, userId: currentUserId },
      })
    : null;

  // 2. Realizar conteo total de reactivos para la paginación matemática
  const totalQuestions = await prisma.bank.findUnique({
    where: { id: resolvedParams.id },
    select: { _count: { select: { questions: true } } },
  });
  const totalItems = totalQuestions?._count.questions || 0;
  const totalPages = Math.ceil(totalItems / currentLimit);

  // 3. Consulta segmentada y paginada directamente en PostgreSQL
  const questionsData = await prisma.question.findMany({
    where: { bankId: resolvedParams.id },
    orderBy: { createdAt: "desc" },
    skip: hasSession ? (currentPage - 1) * currentLimit : 0,
    take: hasSession ? currentLimit : 5,
  });

  // Sanitizar respuestas si no hay sesión — NUNCA llegan al cliente
  const sanitizedQuestions = questionsData.map((q) => ({
    ...q,
    answers: hasSession ? q.answers : [], // array vacío, no null
  }));

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* HEADER GLOBAL */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1 group transition-colors"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />{" "}
            Volver al Tablero
          </Link>

          {hasSession ? (
            <Link
              href={`/bank/${bankInfo.id}/quiz`}
              className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-colors"
            >
              <Play size={12} className="fill-white" /> Iniciar Simulador
            </Link>
          ) : (
            <button
              disabled
              className="bg-slate-200 text-slate-400 px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-not-allowed border border-slate-300/60 shadow-sm"
            >
              <Lock size={12} /> Iniciar Simulador
            </button>
          )}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div
          className={`grid grid-cols-1 gap-2 overflow-hidden  ${isOwner ? "lg:grid-cols-2" : ""}`}
          style={
            isOwner ? { height: "calc(100vh - 160px)", minHeight: "520px" } : {}
          }
        >
          {/* COLUMNA IZQUIERDA: siempre visible */}
          <div className={`flex flex-col overflow-hidden`}>
            <div className="px-5 py-4 border-b border-slate-200 flex-shrink-0">
              <span className="text-[10px] font-bold font-mono tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                Banco Activo
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight leading-tight">
                {bankInfo.title}
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-1 uppercase">
                ID: {bankInfo.id}
              </p>
            </div>
            {isOwner && (
              <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-md shadow-sm">
                <DeleteBankButton bankId={bankInfo.id} />
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {isOwner ? (
                <div className="border-b border-slate-200">
                  <BankSettingsForm
                    bankId={bankInfo.id}
                    initialIsPublic={bankInfo.isPublic}
                    initialAllowReviews={bankInfo.allowReviews}
                    initialMaxAttempts={bankInfo.maxAttempts}
                    initialAllowRevealKey={bankInfo.allowRevealKey}
                    initialTimeLimit={bankInfo.timeLimit}
                  />
                </div>
              ) : (
                /* PANEL DE DETALLES (SOLO LECTURA) */
                <div className="p-6 border-b border-slate-200 bg-white">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Parámetros de Evaluación
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-md">
                      <Clock className="text-blue-900" size={18} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Tiempo Límite
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {bankInfo.timeLimit > 0
                            ? `${bankInfo.timeLimit} minutos`
                            : "Ilimitado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-md">
                      <Target className="text-blue-900" size={18} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Intentos
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {bankInfo.maxAttempts > 0
                            ? bankInfo.maxAttempts
                            : "Infinitos"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-md">
                      <Eye className="text-blue-900" size={18} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Clave Correcta
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {bankInfo.allowRevealKey
                            ? "Visible al final"
                            : "Oculta"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ReviewSection siempre visible, con paginación interna */}
              <ReviewSection
                reviews={bankInfo.reviews}
                allowReviews={bankInfo.allowReviews}
                bankId={bankInfo.id}
                isOwner={isOwner}
                hasSession={hasSession}
                userAlreadyReviewed={!!userExistingReview}
                currentUserId={currentUserId}
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: solo si es owner */}
          {isOwner && (
            <div className="flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Añadir Reactivo
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <QuestionForm bankId={bankInfo.id} />
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-200" />
        <div className="w-full space-y-6">
          <div className="flex justify-between items-baseline border-b pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ítems Registrados
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {hasSession
                ? `${totalItems} Preguntas`
                : `Muestra de ${questionsData.length} Preguntas`}
            </span>
          </div>

          {/* Control de Paginación Avanzado */}
          {hasSession && (
            <div className="mt-6">
              <BankPagination
                totalPages={totalPages}
                currentPage={currentPage}
                totalItems={totalItems}
                currentLimit={currentLimit}
              />
            </div>
          )}

          <div className="pt-2">
            {sanitizedQuestions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                bankId={bankInfo.id}
                index={
                  hasSession ? (currentPage - 1) * currentLimit + index : index
                }
                total={totalItems}
                hasSession={hasSession}
                isOwner={isOwner}
              />
            ))}

            {!hasSession && totalItems > 0 && (
              <div className="p-6 border border-dashed border-blue-200 rounded-lg bg-blue-50/50 text-center space-y-2 mt-4 max-w-2xl mx-auto">
                <Lock className="mx-auto text-blue-900" size={20} />
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                  Contenido Restringido
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estás viendo una muestra limitada de 5 reactivos en modo
                  incógnito. Por favor, **inicia sesión con Google** para
                  desbloquear la vista completa.
                </p>
              </div>
            )}

            {totalItems === 0 && (
              <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-400 font-medium">
                  Este banco de preguntas no contiene reactivos disponibles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
