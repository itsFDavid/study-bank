"use client";

import { useState } from "react";
import { ReviewData } from "@/types";
import { Edit2, Trash2, Star, User, ChevronLeft, ChevronRight } from "lucide-react";
import { updateReview, deleteReview } from "@/app/review-actions";
import { toast } from "sonner";
import Image from "next/image";
import SubmitReviewForm from "./SubmitReviewForm";

interface ReviewSectionProps {
  reviews: ReviewData[];
  allowReviews: boolean;
  bankId: string;
  isOwner: boolean;
  hasSession: boolean;
  userAlreadyReviewed: boolean;
  currentUserId?: string;
}

const REVIEWS_PER_PAGE = 3;

export default function ReviewSection({
  reviews,
  allowReviews,
  bankId,
  isOwner,
  hasSession,
  userAlreadyReviewed,
  currentUserId
}: ReviewSectionProps) {
  const [page, setPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

  const handleDeleteReview = (reviewId: string) => {
    toast.warning("¿Eliminar tu reseña?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const result = await deleteReview(reviewId);
          if (result.success) {
            toast.success("Reseña eliminada.");
          } else {
            toast.error(result.error);
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  };

  const handleStartEdit = (review: ReviewData) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (reviewId: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("reviewId", reviewId);
    formData.append("rating", editRating.toString());
    formData.append("comment", editComment);

    const result = await updateReview(formData);
    if (result.success) {
      toast.success("Reseña actualizada.");
      setEditingReviewId(null);
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  {
    paginated.map((review) => {
      const isMyReview = currentUserId && review.user.id === currentUserId;
      const isEditing = editingReviewId === review.id;

      return (
        <div
          key={review.id}
          className="p-4 bg-slate-50 border border-slate-100 rounded-md space-y-2 text-sm"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* avatar + nombre — igual que antes */}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                {review.rating.toFixed(1)} ★
              </div>
              {/* Botones de editar/eliminar — solo para la reseña propia */}
              {isMyReview && !isEditing && (
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => handleStartEdit(review)}
                    className="p-1 text-slate-400 hover:text-blue-700 transition-colors"
                    title="Editar reseña"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-1 text-slate-400 hover:text-rose-700 transition-colors"
                    title="Eliminar reseña"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modo edición inline */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              {/* Selector de estrellas simplificado */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEditRating(s)}
                  >
                    <Star
                      size={16}
                      className={
                        s <= editRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={2}
                maxLength={1000}
                className="w-full text-xs p-2 border border-slate-300 rounded resize-none outline-none focus:border-slate-900"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingReviewId(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateReview(review.id)}
                  disabled={isUpdating || editComment.trim().length < 5}
                  className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      );
    });
  }

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
