"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/review-actions";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubmitReviewFormProps {
  bankId: string;
}

export default function SubmitReviewForm({ bankId }: SubmitReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState<number>(5.0);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (comment.trim().length < 5) {
      toast.error("El comentario debe tener al menos 5 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.append("bankId", bankId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment.trim());

    startTransition(async () => {
      const toastId = toast.loading("Enviando reseña...");
      const result = await submitReview(formData);

      if (result.success) {
        toast.success("Reseña enviada. ¡Gracias por tu retroalimentación!", {
          id: toastId,
        });
        setComment("");
        setRating(5.0);
      } else {
        toast.error(result.error, { id: toastId });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4"
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Retroalimentación Académica
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Deja tus dudas o califica la calidad de este banco de preguntas.
        </p>
      </div>

      {/* Selector de Estrellas con Soporte Decimal */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase">
          Calificación ({rating.toFixed(1)} de 5.0)
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  size={20}
                  className={
                    isSelected
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }
                />
              </button>
            );
          })}
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-24 ml-4 accent-slate-900 h-1 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Caja de Comentarios */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase">
          Comentario o Sugerencia
        </label>
        <div className="relative">
          <MessageSquare
            className="absolute left-3 top-3 text-slate-400"
            size={16}
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe aquí tus observaciones sobre los reactivos..."
            rows={3}
            maxLength={1000}
            required
            disabled={isPending}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-slate-800 placeholder:text-slate-400 resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-950 hover:bg-slate-800 text-white py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-2 shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        Enviar Evaluación
      </button>
    </form>
  );
}
