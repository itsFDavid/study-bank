"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Si usas shadcn/ui o tailwind-merge, si no, puedes usar strings normales

interface FlashCardProps {
  question: string;
  answers: string[]; // Las respuestas correctas
  options: string[]; // Las opciones (A, B, C, D...)
}

export default function FlashCard({
  question,
  answers,
  options,
}: FlashCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Normalizamos las respuestas para evitar errores por mayúsculas/espacios
  const normalizedAnswers = answers.map((a) => a.trim().toLowerCase());

  const isCorrectOption = (option: string) => {
    return normalizedAnswers.includes(option.trim().toLowerCase());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* CABECERA DE LA TARJETA */}
      <div className="p-6 border-b border-gray-100 bg-white">
        <h3 className="text-lg md:text-xl font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
          {question}
        </h3>
      </div>

      {/* CUERPO DE LA TARJETA */}
      <div className="p-6 bg-gray-50/30">
        {/* Si hay opciones (Opción Múltiple) */}
        {options && options.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, idx) => {
              const isCorrect = isCorrectOption(option);

              let cardClass =
                "relative p-4 rounded-lg border text-sm font-medium transition-all duration-300 flex items-center gap-3 ";

              if (showAnswer) {
                if (isCorrect) {
                  cardClass +=
                    "bg-green-50 border-green-200 text-green-800 shadow-sm ring-1 ring-green-100";
                } else {
                  cardClass +=
                    "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                }
              } else {
                cardClass +=
                  "bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-help";
              }

              return (
                <div key={idx} className={cardClass}>
                  {/* Icono de check si es correcta y se está mostrando */}
                  {showAnswer && isCorrect && (
                    <CheckCircle2
                      size={18}
                      className="text-green-600 flex-shrink-0"
                    />
                  )}
                  {/* Letra de opción (A, B, C...) opcional */}
                  <span
                    className={
                      showAnswer && isCorrect
                        ? "text-green-600 font-bold"
                        : "text-gray-400 font-semibold"
                    }
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Si NO hay opciones (Pregunta abierta), mostramos caja simple */
          <div
            className={`transition-all duration-500 overflow-hidden ${showAnswer ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-800">
              <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-green-600">
                Respuesta Correcta:
              </span>
              {answers.join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* PIE DE LA TARJETA (BOTÓN) */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            showAnswer
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
        >
          {showAnswer ? (
            <>
              <EyeOff size={16} /> Ocultar respuesta
            </>
          ) : (
            <>
              <Eye size={16} /> Ver respuesta correcta
            </>
          )}
        </button>
      </div>
    </div>
  );
}
