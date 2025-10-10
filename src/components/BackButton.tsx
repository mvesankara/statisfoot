"use client";

import { usePathname, useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
  variant?: "dark" | "light";
};

export function BackButton({ className = "", variant = "dark" }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
  const variantClasses =
    variant === "light"
      ? "border-slate-200 text-slate-600 hover:border-primary/60 hover:text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      : "border-white/10 text-slate-200 hover:border-accent/60 hover:text-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end";

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${baseClasses} ${variantClasses} ${className}`.trim()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Retour
    </button>
  );
}
