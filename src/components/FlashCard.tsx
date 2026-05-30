"use client";

import { useState, useId } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface FlashCardProps {
  question: string;
  answers: string[];
  options: string[];
  hasSession?: boolean;
}

export default function FlashCard({
  question,
  answers,
  options,
  hasSession = true,
}: FlashCardProps) {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  // Si no hay sesión, answers llega [] desde el servidor — nunca hay datos reales que ocultar
  const normalizedAnswers = answers.map((a: string) => a.trim().toLowerCase());
  const cardId = useId();

  return (
    <div className="bg-white rounded-md border border-slate-200 mb-4 hover:border-slate-300 transition-colors select-none">
      <div className="p-5">
        <p className="text-slate-900 text-base leading-relaxed whitespace-pre-wrap font-medium">
          {question}
        </p>

        <div className="mt-4 grid gap-2 relative">
          {!hasSession ? (
            // Sin sesión: placeholder visual puro, sin datos reales
            <>
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded">
                <span className="bg-slate-900/90 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-md flex items-center gap-1.5">
                  <Lock size={12} /> Inicia sesión para ver opciones
                </span>
              </div>
              {/* Filas fantasma — solo CSS, sin texto real */}
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 px-3 py-2 rounded border border-transparent blur-sm"
                >
                  <span className="font-mono font-bold text-slate-300 text-sm">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <div
                    className="h-4 rounded bg-slate-200 mt-0.5"
                    style={{ width: `${55 + ((idx * 17) % 30)}%` }}
                  />
                </div>
              ))}
            </>
          ) : (
            // Con sesión: opciones reales con highlight de respuesta correcta
            options?.map((opt: string, idx: number) => {
              const isCorrect = normalizedAnswers.includes(
                opt.trim().toLowerCase(),
              );
              const highlight = showAnswer && isCorrect;
              return (
                <div
                  key={idx}
                  className={`flex gap-3 text-sm px-3 py-2 rounded border ${
                    highlight
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-transparent border-transparent text-slate-600"
                  }`}
                >
                  <span
                    className={`font-mono font-bold ${highlight ? "text-emerald-700" : "text-slate-400"}`}
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{opt}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-slate-50 px-5 py-2 border-t border-slate-200 flex justify-between items-center">
        <div className="text-[10px] text-slate-400 font-mono uppercase">
          ID: {cardId.slice(-6)}
        </div>

        {hasSession ? (
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1.5 uppercase tracking-wide"
          >
            {showAnswer ? (
              <>
                <EyeOff size={12} /> Hide Key
              </>
            ) : (
              <>
                <Eye size={12} /> Reveal Key
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 cursor-not-allowed">
            <Lock size={12} /> Key Locked
          </span>
        )}
      </div>
    </div>
  );
}
