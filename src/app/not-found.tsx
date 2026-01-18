import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-12 rounded-lg shadow-sm text-center max-w-md w-full">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The requested resource could not be located on this server. Please
          verify the URL or contact the system administrator.
        </p>
        <div className="border-t border-slate-100 pt-6">
          <Link
            href="/"
            className="text-sm font-bold text-blue-900 hover:text-blue-700 uppercase tracking-wide"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
      <div className="mt-8 text-xs text-slate-400 font-mono">
        Error Code: 404_RESOURCE_MISSING
      </div>
    </div>
  );
}
