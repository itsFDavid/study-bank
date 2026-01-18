"use client";

import { useState } from "react";
import { deleteBank } from "@/app/actions";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DeleteBankButton({ bankId }: { bankId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    if (isDeleting) return; // Evitar cerrar si está procesando
    setIsOpen(false);
    setConfirmInput("");
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de seguridad estricta
    if (confirmInput !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteBank(bankId);
      router.push("/");
    } catch (error) {
      console.error("Error deleting bank");
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 1. BOTÓN DISPARADOR (El diseño original que te gustaba) */}
      <button
        onClick={handleOpen}
        className="text-slate-400 hover:text-rose-700 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-transparent hover:border-rose-200 px-3 py-1.5 rounded"
        title="Delete Entire Bank"
      >
        <Trash2 size={14} />
        Delete Bank
      </button>

      {/* 2. MODAL / DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop (Fondo oscuro borroso) */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />

          {/* Contenido del Modal */}
          <div className="relative bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600" />
                Security Check
              </h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <form onSubmit={handleDelete} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  This action is{" "}
                  <span className="font-bold text-slate-900">irreversible</span>
                  . You are about to permanently remove this examination bank
                  and all associated questions.
                </p>

                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  To confirm, type `DELETE` below
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full text-sm p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                  autoFocus
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmInput !== "DELETE" || isDeleting}
                  className={cn(
                    "px-4 py-2 text-white text-sm font-bold rounded flex items-center gap-2 transition-all shadow-sm",
                    confirmInput === "DELETE" && !isDeleting
                      ? "bg-rose-700 hover:bg-rose-800"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                  )}
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Confirm Deletion
                </button>
              </div>
            </form>

            {/* Barra inferior decorativa de advertencia */}
            <div className="h-1 w-full bg-rose-600" />
          </div>
        </div>
      )}
    </>
  );
}
