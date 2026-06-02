"use client";

import { useState, useTransition } from "react";
import { updateBank } from "@/app/actions";
import { Save, Loader2, Eye, EyeOff, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface BankSettingsFormProps {
  bankId: string;
  initialIsPublic: boolean;
  initialAllowReviews: boolean;
  initialMaxAttempts: number;
  initialAllowRevealKey: boolean; 
  initialTimeLimit: number;
}

export default function BankSettingsForm({
  bankId,
  initialIsPublic,
  initialAllowReviews,
  initialMaxAttempts,
  initialAllowRevealKey,
  initialTimeLimit
}: BankSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);
  const [allowReviews, setAllowReviews] =
    useState<boolean>(initialAllowReviews);
  
  const [allowRevealKey, setAllowRevealKey] = 
    useState<boolean>(initialAllowRevealKey);

  const [timeLimit, setTimeLimit] = 
    useState<number>(initialTimeLimit);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("isPublic", isPublic.toString());
    formData.append("allowReviews", allowReviews.toString());
    formData.append("allowRevealKey", allowRevealKey.toString());
    formData.append("timeLimit", timeLimit.toString());

    startTransition(async () => {
      const toastId = toast.loading("Guardando configuración...");
      const result = await updateBank(bankId, formData);

      if (!result.success) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success("Configuración guardada", { id: toastId });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4"
    >
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Configuración del Banco
      </h3>

      <div className="flex items-center justify-between py-2">
        <div className="flex flex-col gap-0.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            {isPublic ? (
              <Eye size={16} className="text-blue-900" />
            ) : (
              <EyeOff size={16} className="text-slate-400" />
            )}
            Visibilidad del Banco
          </label>
          <span className="text-xs text-slate-400">
            Público permite que invitados resuelvan el test.
          </span>
        </div>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 accent-slate-900 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between py-2 border-t border-slate-100">
        <div className="flex flex-col gap-0.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-500" />
            Permitir Reseñas y Dudas
          </label>
          <span className="text-xs text-slate-400">
            Habilita comentarios y estrellas a la comunidad.
          </span>
        </div>
        <input
          type="checkbox"
          checked={allowReviews}
          onChange={(e) => setAllowReviews(e.target.checked)}
          className="w-4 h-4 accent-slate-900 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between py-2 border-t border-slate-100 gap-4">
        <div className="flex flex-col gap-0.5">
          <label className="text-sm font-semibold text-slate-800">
            Límite de Intentos
          </label>
          <span className="text-xs text-slate-400">
            0 equivale a intentos infinitos de práctica.
          </span>
        </div>
        <input
          type="number"
          name="maxAttempts"
          defaultValue={initialMaxAttempts}
          min={0}
          max={100}
          className="w-20 bg-white border border-slate-300 text-sm px-2 py-1 rounded outline-none focus:border-slate-900 text-right text-slate-800 font-mono"
          required
        />
      </div>

      {/* Toggle: Allow Reveal Key */}
      <div className="flex items-center justify-between py-2 border-t border-slate-100">
        <div className="flex flex-col gap-0.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Eye size={16} className="text-slate-500" />
            Mostrar Respuestas al Finalizar
          </label>
          <span className="text-xs text-slate-400">
            Permite ver la clave correcta en la pantalla de resultados.
          </span>
        </div>
        <input
          type="checkbox"
          checked={allowRevealKey}
          onChange={(e) => setAllowRevealKey(e.target.checked)}
          className="w-4 h-4 accent-slate-900 cursor-pointer"
        />
      </div>

      {/* Input: Time Limit */}
      <div className="flex items-center justify-between py-2 border-t border-slate-100 gap-4">
        <div className="flex flex-col gap-0.5">
          <label className="text-sm font-semibold text-slate-800">
            Tiempo Límite (minutos)
          </label>
          <span className="text-xs text-slate-400">
            0 equivale a tiempo ilimitado.
          </span>
        </div>
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={0}
          max={300}
          className="w-20 bg-white border border-slate-300 text-sm px-2 py-1 rounded outline-none focus:border-slate-900 text-right text-slate-800 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 bg-slate-950 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )}
        Guardar Parámetros
      </button>
    </form>
  );
}
