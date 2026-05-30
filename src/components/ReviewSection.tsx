"use client";

import { useState } from "react";
import { ReviewData } from "@/types";
import { Star, User, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import SubmitReviewForm from "./SubmitReviewForm";

interface ReviewSectionProps {
  reviews: ReviewData[];
  allowReviews: boolean;
  bankId: string;
  isOwner: boolean;
  hasSession: boolean;
  userAlreadyReviewed: boolean;
}

const REVIEWS_PER_PAGE = 3;

export default function ReviewSection({
  reviews,
  allowReviews,
  bankId,
  isOwner,
  hasSession,
  userAlreadyReviewed,
}: ReviewSectionProps) {
  const [page, setPage] = useState(1);

  const averageRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          ).toFixed(1),
        )
      : 0;

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginated = reviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE,
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header con promedio */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Métricas de Evaluación
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Puntuación colectiva basada en {reviews.length} revisiones.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <span className="text-base font-mono font-bold text-amber-900">
            {averageRating || "N/A"}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      {!allowReviews ? (
        <div className="p-4 bg-slate-50 text-center rounded border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            El creador ha deshabilitado los comentarios en este banco.
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4 italic">
          No hay comentarios en este banco de reactivos aún.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-slate-50 border border-slate-100 rounded-md space-y-2 text-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                        <User size={10} />
                      </div>
                    )}
                    <span className="font-semibold text-slate-700 text-xs">
                      {review.user.name || "Estudiante Anónimo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    {review.rating.toFixed(1)} ★
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Formulario: visitante autenticado, no owner, reseñas habilitadas */}
      {!isOwner && hasSession && allowReviews && !userAlreadyReviewed && (
        <div className="pt-2 border-t border-slate-100">
          <SubmitReviewForm bankId={bankId} />
        </div>
      )}

      {!isOwner && hasSession && allowReviews && userAlreadyReviewed && (
        <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 uppercase tracking-wider">
          Ya enviaste una reseña para este banco.
        </p>
      )}
    </div>
  );
}
