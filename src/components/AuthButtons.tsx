"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1 rounded-full shadow-sm">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User profile"}
              width={24}
              height={24}
              className="rounded-full border border-slate-300"
            />
          ) : (
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <UserIcon size={12} />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 tracking-tight max-w-[120px] truncate">
            {session.user.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-slate-400 hover:text-rose-600 p-2 rounded-md hover:bg-rose-50/50 transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 shadow-sm"
    >
      <LogIn size={14} />
      Sign In with Google
    </button>
  );
}
