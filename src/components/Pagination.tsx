"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({
  totalPages,
  currentPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-100 font-sans">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 border border-slate-200 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider px-3">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 border border-slate-200 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
