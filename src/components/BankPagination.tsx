"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface BankPaginationProps {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  currentLimit: number;
}

export default function BankPagination({
  totalPages,
  currentPage,
  totalItems,
  currentLimit,
}: BankPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calcular el rango dinámico de visualización
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const endItem = Math.min(currentPage * currentLimit, totalItems);

  const handleParamChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "limit") params.set("page", "1"); // Resetea a la página 1 si cambia el tamaño
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 font-sans w-full bg-white p-4 rounded-lg shadow-sm border text-slate-700">
      {/* Selector de items por página e indicador de rango */}
      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono font-medium text-slate-500">
          Mostrando {startItem}-{endItem} de {totalItems}
        </span>
        <div className="h-4 w-px bg-slate-200" />
        <label className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
          Filas:
        </label>
        <select
          value={currentLimit}
          onChange={(e) => handleParamChange("limit", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-1 outline-none font-mono font-bold focus:border-slate-900 cursor-pointer"
        >
          {[10, 15, 20, 30, 40, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              handleParamChange("page", (currentPage - 1).toString())
            }
            disabled={currentPage <= 1}
            className="p-2 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="text-xs font-mono font-bold px-2 text-slate-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() =>
              handleParamChange("page", (currentPage + 1).toString())
            }
            disabled={currentPage >= totalPages}
            className="p-2 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
