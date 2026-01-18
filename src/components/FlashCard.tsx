"use client";
import { useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FlashCard({
  question,
  answers,
  options,
}: {
  question: string;
  answers: string[];
  options: string[];
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const normalizedAnswers = answers.map((a: string) => a.trim().toLowerCase());
  const cardId = useId();

  return (
    <div className="bg-white rounded-md border border-slate-200 mb-4 hover:border-slate-300 transition-colors">
      <div className="p-5">
        <p className="text-slate-900 text-base leading-relaxed whitespace-pre-wrap font-medium">
          {question}
        </p>

        <div className="mt-4 grid gap-2">
          {options?.map((opt: string, idx: number) => {
            const isCorrect = normalizedAnswers.includes(
              opt.trim().toLowerCase(),
            );
            const highlight = showAnswer && isCorrect;
            return (
              <div
                key={idx}
                className={`flex gap-3 text-sm px-3 py-2 rounded border ${highlight ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-transparent border-transparent text-slate-600"}`}
              >
                <span
                  className={`font-mono font-bold ${highlight ? "text-emerald-700" : "text-slate-400"}`}
                >
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 px-5 py-2 border-t border-slate-200 flex justify-between items-center">
        <div className="text-[10px] text-slate-400 font-mono uppercase">
          ID: {cardId.slice(-6)}
        </div>
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
      </div>
    </div>
  );
}
