"use client";

import { useState } from "react";
import { Menu, X, Clock, BookOpen, Layers } from "lucide-react";
import AuthButtons from "./AuthButtons";
import { useRouter, useSearchParams } from "next/navigation";

interface ResponsiveHeaderProps {
  formattedDate: string;
  hasSession: boolean;
}

export default function ResponsiveHeader({
  formattedDate,
  hasSession,
}: ResponsiveHeaderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "all";

  const navigateToView = (view: string) => {
    setIsOpen(false);
    router.push(`/?view=${view}&page=1`);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="h-5 w-5 bg-slate-950 rounded-sm" />
          <span className="font-bold text-slate-900 tracking-tight text-sm md:text-base">
            STUDY<span className="font-light text-slate-500">BANK</span>
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider border-l border-slate-100 pl-6 mr-auto">
          <button
            onClick={() => navigateToView("all")}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${currentView === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
          >
            <BookOpen size={14} /> Inicio
          </button>
          {hasSession && (
            <button
              onClick={() => navigateToView("mine")}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${currentView === "mine" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
            >
              <Layers size={14} /> Mis Bancos
            </button>
          )}
        </nav>

        {/* Desktop Rigth Elements */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Clock size={14} />
            <span>{formattedDate}</span>
          </div>
          <AuthButtons />
        </div>

        {/* Mobile Hamburguer Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-600 hover:text-slate-900 p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Slide Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg flex flex-col p-6 space-y-4 z-40 md:hidden animate-in fade-in slide-in-from-top-5 duration-150">
          <div className="flex flex-col gap-1 w-full text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => navigateToView("all")}
              className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-2 ${currentView === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
            >
              <BookOpen size={16} /> Inicio (Públicos)
            </button>
            {hasSession && (
              <button
                onClick={() => navigateToView("mine")}
                className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-2 ${currentView === "mine" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
              >
                <Layers size={16} /> Mis Bancos (Propios)
              </button>
            )}
          </div>
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider px-4">
              <Clock size={14} />
              <span>{formattedDate}</span>
            </div>
            <div className="px-4">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
