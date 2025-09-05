// src/app/(auth)/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-ink via-brand-ink to-brand-navy text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header logo */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/brand/statisfoot-logo.png"
            alt="Statisfoot"
            width={44}
            height={44}
            priority
            className="rounded-lg"
          />
          <div className="text-xl font-semibold">
            Statis<span className="text-brand-sky">is</span>foot
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <div className="p-6 sm:p-8">{children}</div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} Statisf<span className="text-brand-sky">is</span>foot
        </p>
      </div>
    </div>
  );
}
