"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Clock,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SubmitReviewForm from "./SubmitReviewForm";
import { submitAttempt } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Interfaces de tipos estrictos
interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  answers: string[];
}

interface QuizRunnerProps {
  questions: QuizQuestion[];
  bankId: string;
  allowReviews: boolean;
  maxAttempts: number;
  allowRevealKey: boolean;
  timeLimit: number;
}

interface CustomSessionUser {
  id: string;
}

export default function QuizRunner({
  questions,
  bankId,
  allowReviews,
  maxAttempts,
  allowRevealKey,
  timeLimit,
}: QuizRunnerProps) {
  const { data: session } = useSession();
  const user = session?.user as CustomSessionUser | undefined;
  const userId: string | undefined = user?.id;

  // --- STATE CON TIPADO ESTRICTO ---
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer State (60 minutes = 3600 seconds)
  const [timeRemaining, setTimeRemaining] = useState<number>(
    timeLimit > 0 ? timeLimit * 60 : 0,
  );

  const currentQuestion = questions[currentIndex];
  const progressPercentage = currentQuestion
    ? ((currentIndex + 1) / questions.length) * 100
    : 100;
  const isMultiSelect = currentQuestion?.answers.length > 1;

  const router = useRouter();
  const [attemptSubmitted, setAttemptSubmitted] = useState<boolean>(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] =
    useState<boolean>(false);

  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState<number>(0);
  const [reviewMode, setReviewMode] = useState<boolean>(false);

  // --- TIMER LOGIC ---
  useEffect(() => {
    // Si no hay límite de tiempo o ya terminó, no iniciar timer
    if (isFinished || timeLimit === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, timeLimit]);

  // Observador independiente para disparar el fin del examen cuando el tiempo llega a 0
  useEffect(() => {
    if (
      timeLimit > 0 &&
      timeRemaining === 0 &&
      !isFinished &&
      !isSubmittingAttempt
    ) {
      handleFinish(userAnswers);
    }
  }, [timeRemaining, isFinished, timeLimit, isSubmittingAttempt, userAnswers]);

  const handleFinish = async (
    finalAnswers: Record<string, string[]> = userAnswers,
  ) => {
    // Evitar múltiples ejecuciones simultáneas
    if (isSubmittingAttempt || attemptSubmitted) return;

    // 1. Bloquear la UI y finalizar el examen INMEDIATAMENTE de forma síncrona
    setIsSubmittingAttempt(true);
    setIsFinished(true);

    const answeredQ = Object.keys(finalAnswers).length;
    let correctCount = 0;
    questions.forEach((q) => {
      const u = finalAnswers[q.id] || [];
      if (
        u.length === q.answers.length &&
        u.every((a) => q.answers.includes(a))
      ) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);

    // 2. Guardar el puntaje en el estado para que la pantalla de resultados pueda renderizarse
    setFinalScore(score);
    setFinalCorrectCount(correctCount);

    // 3. Enviar la petición asíncrona al servidor
    const result = await submitAttempt(
      bankId,
      score,
      questions.length,
      answeredQ,
    );

    // 4. Manejar la respuesta del servidor
    if (!result.success) {
      toast.error(
        result.error || "No se pudo registrar el intento en el historial.",
      );
      setIsSubmittingAttempt(false);
      // El usuario ya está en la pantalla de resultados gracias al setIsFinished(true) superior
      return;
    }

    setAttemptSubmitted(true);
    setIsSubmittingAttempt(false);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- HANDLERS ---
  const toggleOption = (option: string): void => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions((prev) => prev.filter((o) => o !== option));
    } else {
      if (!isMultiSelect && selectedOptions.length > 0) {
        setSelectedOptions([option]);
      } else {
        setSelectedOptions((prev) => [...prev, option]);
      }
    }
  };

  const handleNext = async (): Promise<void> => {
    if (!currentQuestion) return;

    const newAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedOptions,
    };
    setUserAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptions([]);
    } else {
      await handleFinish(newAnswers);
    }
  };

  // --- HELPERS ---
  const resetQuiz = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeRemaining(timeLimit > 0 ? timeLimit * 60 : 0);
    setIsFinished(false);
    setFinalScore(0);
    setFinalCorrectCount(0);
    setReviewMode(false);
    setIsSubmittingAttempt(false);
    setAttemptSubmitted(false);
  };

  if (!currentQuestion && !isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <p className="text-xs text-slate-400 font-medium">
          Este banco no posee reactivos cargados.
        </p>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q) => {
      const u = userAnswers[q.id] || [];
      const c = q.answers;
      if (u.length === c.length && u.every((ans) => c.includes(ans)))
        correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <div className="max-w-5xl mx-auto py-12 px-6 font-sans space-y-8">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* HEADER: Formal Report Style */}
          <div className="bg-slate-900 border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-200 uppercase tracking-wide">
                Examination Report
              </h2>
              <p className="text-sm text-slate-400 font-mono mt-1">
                ID: {bankId.slice(-8).toUpperCase()} •{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* PASS/FAIL BADGE (Top Right Corner) */}
            <div
              className={cn(
                "px-6 py-2 rounded border text-sm font-bold uppercase tracking-widest shadow-sm",
                passed
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-rose-100 text-rose-800 border-rose-200",
              )}
            >
              {passed ? "Pass" : "Fail"}
            </div>
          </div>

          {/* SCORE SECTION */}
          <div className="bg-slate-900 p-8 border-b border-slate-100 text-center">
            <div className="inline-flex flex-col items-center">
              <span className="text-6xl font-bold text-slate-200 tracking-tighter">
                {score}%
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase mt-2 tracking-widest">
                Final Score
              </span>
            </div>
          </div>

          {/* QUESTION REVIEW */}
          <div className="divide-y divide-slate-100">
            {questions.map((q, i) => {
              const uAnswers = userAnswers[q.id] || [];
              const isCorrect =
                uAnswers.length === q.answers.length &&
                uAnswers.every((a) => q.answers.includes(a));

              return (
                <div
                  key={q.id}
                  className="p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex gap-5">
                    {/* Status Icon */}
                    <div className="mt-1 flex-shrink-0">
                      {isCorrect ? (
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center">
                          <X size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Item {i + 1}
                        </span>
                        {!isCorrect && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                            Incorrect
                          </span>
                        )}
                      </div>

                      <p className="text-slate-900 font-medium text-base mb-4 whitespace-break-spaces leading-relaxed">
                        {q.questionText}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* User Response */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-wider">
                            Selected Response
                          </span>
                          {uAnswers.length > 0 ? (
                            uAnswers.map((a) => (
                              <div
                                key={a}
                                className="text-slate-700 font-medium mb-1 last:mb-0 flex items-start gap-2"
                              >
                                <span className="text-slate-400">•</span> {a}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">
                              No response provided
                            </span>
                          )}
                        </div>

                        {/* Correct Answer (Only show if wrong) */}
                        {!isCorrect && allowRevealKey && (
                          <div className="bg-white p-4 rounded border border-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-2 tracking-wider">
                              Correct Key
                            </span>
                            {q.answers.map((a: string) => (
                              <div
                                key={a}
                                className="text-emerald-900 font-medium mb-1 last:mb-0 flex items-start gap-2"
                              >
                                <Check
                                  size={14}
                                  className="mt-0.5 text-emerald-600"
                                />{" "}
                                {a}
                              </div>
                            ))}
                          </div>
                        )}

                        {!isCorrect && !allowRevealKey && (
                          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center justify-center">
                            <p className="text-xs text-slate-400 text-center">
                              El autor ha deshabilitado la visualización de
                              respuestas correctas.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => {
                if (attemptSubmitted) router.push(`/bank/${bankId}`);
              }}
              disabled={!attemptSubmitted}
              className={cn(
                "w-full sm:w-auto text-center px-6 py-2.5 border border-slate-300 bg-white text-slate-700 font-semibold rounded text-sm shadow-sm transition-colors",
                attemptSubmitted
                  ? "hover:bg-slate-50 cursor-pointer"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              {isSubmittingAttempt
                ? "Guardando resultado..."
                : "Return to Bank"}
            </button>
            <button
              onClick={resetQuiz}
              disabled={!attemptSubmitted}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-colors shadow-sm",
                attemptSubmitted
                  ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              <RotateCcw size={16} />
              Retake Examination
            </button>
          </div>
        </div>

        {/* Formulario de Reseñas acoplado al final bajo el mismo ancho y consistencia visual */}
        {allowReviews && userId && (
          <div className="w-full">
            <SubmitReviewForm bankId={bankId} />
          </div>
        )}
      </div>
    );
  }

  // --- QUIZ INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER CORREGIDO: Usamos GRID para alinear perfectamente los 3 elementos */}
      <div className="bg-white border-b border-slate-200 h-16 grid grid-cols-3 items-center px-6 fixed top-0 left-0 w-full z-30 shadow-sm">
        {/* COLUMNA IZQUIERDA: Botón Salir + Contador */}
        <div className="flex items-center gap-4">
          <Link
            href={`/bank/${bankId}`}
            className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 group"
            title="Quit Exam"
          >
            <div className="p-1.5 rounded-md group-hover:bg-rose-50">
              <LogOut size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
              Quit
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block" />

          <span className="font-mono text-slate-500 text-xs md:text-sm font-medium uppercase tracking-wider">
            Item {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* COLUMNA CENTRAL: Barra de Progreso (Centrada perfectamente) */}
        <div className="flex justify-center px-4">
          <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Timer (Alineado al final) */}
        <div className="flex justify-end">
          {timeLimit > 0 ? (
            <div
              className={cn(
                "flex items-center gap-2 font-mono text-sm md:text-base font-medium px-3 py-1 rounded-md bg-slate-50 border border-slate-100",
                timeRemaining < 60
                  ? "text-rose-600 bg-rose-50 border-rose-100"
                  : timeRemaining < 300
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-slate-900",
              )}
            >
              <Clock
                size={16}
                className={
                  timeRemaining < 60 ? "text-rose-500" : "text-slate-400"
                }
              />
              {formatTime(timeRemaining)}
            </div>
          ) : (
            <div /> // espacio vacío para mantener el grid de 3 columnas
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-lg shadow-sm p-8 md:p-12 min-h-[50vh] flex flex-col">
          {/* Question Stem */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.questionText}
            </h2>
            {isMultiSelect && (
              <div className="mt-4 flex items-center gap-2 text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-100 text-xs font-bold uppercase tracking-wide inline-block">
                <AlertTriangle size={14} />
                Select all that apply ({currentQuestion.answers.length}{" "}
                required)
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 flex-grow">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <div
                  key={idx}
                  onClick={() => toggleOption(option)}
                  className={cn(
                    "group flex items-start p-4 border rounded cursor-pointer transition-all duration-150 select-none",
                    isSelected
                      ? "bg-blue-50/50 border-blue-900 shadow-[0_0_0_1px_rgba(30,58,138,1)]"
                      : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-5 h-5 border rounded-sm flex items-center justify-center mr-4 transition-colors flex-shrink-0",
                      isSelected
                        ? "bg-blue-900 border-blue-900"
                        : "bg-white border-slate-300 group-hover:border-slate-400",
                    )}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div
                    className={cn(
                      "text-sm md:text-base leading-relaxed",
                      isSelected
                        ? "text-slate-900 font-medium"
                        : "text-slate-600",
                    )}
                  >
                    {option}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="mt-10 flex justify-end pt-6 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
              className="bg-slate-900 text-white px-8 py-3 rounded font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
            >
              {currentIndex === questions.length - 1
                ? "Submit Examination"
                : "Next Question"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
