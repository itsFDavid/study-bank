"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

type QuestionType = {
  id: string;
  questionText: string;
  answers: string[]; // ARRAY de respuestas correctas
  options: string[];
};

export default function QuizRunner({
  questions,
  bankId,
}: {
  questions: QuestionType[];
  bankId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // AHORA el estado es un array de strings (las opciones seleccionadas por el usuario actual)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Mapa: idPregunta -> Array de respuestas del usuario
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});

  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Detectamos si es multi-select para cambiar la UI y el texto
  const isMultiSelect = currentQuestion.answers.length > 1;

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions((prev) => prev.filter((o) => o !== option));
    } else {
      setSelectedOptions((prev) => [...prev, option]);
    }
  };

  const handleNext = () => {
    // Guardamos lo que seleccionó el usuario
    const newAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedOptions,
    };
    setUserAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptions([]); // Limpiar selección
    } else {
      setIsFinished(true);
      checkScore(newAnswers);
    }
  };

  const checkScore = (finalAnswers: Record<string, string[]>) => {
    let correctCount = 0;

    questions.forEach((q) => {
      const uAnswers = finalAnswers[q.id] || [];
      const correctAnswers = q.answers;

      // LOGICA DE VALIDACIÓN ESTRICTA:
      // 1. Misma cantidad de respuestas
      // 2. Todas las respuestas del usuario están en las respuestas correctas
      const isCorrect =
        uAnswers.length === correctAnswers.length &&
        uAnswers.every((ans) => correctAnswers.includes(ans));

      if (isCorrect) correctCount++;
    });

    if (correctCount / questions.length > 0.7) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  // --- VISTA RESULTADOS ---
  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q) => {
      const u = userAnswers[q.id];
      const c = q.answers;
      if (u.length === c.length && u.every((ans) => c.includes(ans)))
        correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Resultado Final</h2>
          <div
            className={`text-6xl font-black mb-2 ${score >= 70 ? "text-green-600" : "text-red-500"}`}
          >
            {score}%
          </div>
          <p className="text-gray-500">
            Aprobaste {correctCount} de {questions.length}
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((q, i) => {
            const uAnswers = userAnswers[q.id] || [];
            const isCorrect =
              uAnswers.length === q.answers.length &&
              uAnswers.every((a) => q.answers.includes(a));

            return (
              <div
                key={q.id}
                className={cn(
                  "p-5 rounded-xl border-l-4",
                  isCorrect
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500",
                )}
              >
                <div className="flex justify-between mb-2">
                  <p className="font-bold text-gray-900 text-lg">
                    {i + 1}. {q.questionText}
                  </p>
                  {isCorrect ? (
                    <span className="text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={16} /> Correcta
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <XCircle size={16} /> Incorrecta
                    </span>
                  )}
                </div>

                {/* Desglose de respuestas */}
                <div className="space-y-1 text-sm mt-3 bg-white/50 p-3 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-500 uppercase text-xs">
                      Tus respuestas:
                    </span>
                    {uAnswers.map((ans) => (
                      <div
                        key={ans}
                        className={cn(
                          "flex items-center gap-2",
                          q.answers.includes(ans)
                            ? "text-green-700"
                            : "text-red-600",
                        )}
                      >
                        {q.answers.includes(ans) ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {ans}
                      </div>
                    ))}
                  </div>

                  {!isCorrect && (
                    <div className="mt-3 border-t pt-2 flex flex-col gap-1">
                      <span className="font-semibold text-gray-500 uppercase text-xs">
                        Solución Correcta:
                      </span>
                      {q.answers.map((ans) => (
                        <div
                          key={ans}
                          className="text-gray-800 font-medium flex items-center gap-2"
                        >
                          <CheckCircle2 size={14} className="text-green-600" />{" "}
                          {ans}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href={`/bank/${bankId}`}
            className="px-6 py-3 rounded-xl border hover:bg-gray-50 font-medium text-gray-700"
          >
            Volver
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA PREGUNTA ---
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span>
            Pregunta {currentIndex + 1}/{questions.length}
          </span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-2 whitespace-pre-wrap leading-snug">
          {currentQuestion.questionText}
        </h2>

        {/* Indicador de Multi-Select */}
        <div className="mb-6">
          {isMultiSelect ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
              <CheckSquare size={12} /> SELECCIONA{" "}
              {currentQuestion.answers.length} OPCIONES
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
              SELECCIÓN ÚNICA
            </span>
          )}
        </div>

        <div className="space-y-3 flex-grow">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <button
                key={idx}
                onClick={() => toggleOption(option)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm"
                    : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600",
                )}
              >
                <span className="font-medium pr-4">{option}</span>
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center border transition-colors",
                    isSelected
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {isSelected && (
                    <CheckSquare size={14} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          // En multi-select no obligamos a seleccionar exactamente el número correcto,
          // pero sí al menos una opción para avanzar.
          disabled={selectedOptions.length === 0}
          className="mt-8 w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          {currentIndex === questions.length - 1 ? "Finalizar" : "Siguiente"}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
