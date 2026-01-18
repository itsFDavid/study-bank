import Link from "next/link";
import { FileQuestion, Home, SearchX } from "lucide-react";

export default function BankNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Icono animado o destacado */}
      <div className="bg-white p-4 rounded-full shadow-lg mb-6 animate-in zoom-in duration-300">
        <div className="bg-red-50 p-6 rounded-full">
          <FileQuestion size={64} className="text-red-500" />
        </div>
      </div>

      {/* Título Principal */}
      <h2 className="text-3xl font-black text-gray-900 mb-3">
        Banco no encontrado
      </h2>

      {/* Descripción amigable */}
      <p className="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">
        Lo sentimos, no pudimos encontrar el banco de preguntas que buscas. Es
        posible que el enlace sea incorrecto o que haya sido eliminado.
      </p>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl"
        >
          <Home size={20} />
          Ir al Inicio
        </Link>
      </div>

      {/* Pie de página pequeño */}
      <p className="text-gray-400 text-sm mt-12">Error 404 - Study Bank App</p>
    </div>
  );
}
