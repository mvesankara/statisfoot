"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

type LogoutButtonProps = {
  /**
   * Classes supplémentaires à appliquer au bouton.
   */
  className?: string;
  /**
   * Variante visuelle du bouton.
   */
  variant?: "solid" | "ghost";
};

/**
 * @component LogoutButton
 * @description Bouton permettant de mettre fin à la session utilisateur depuis un composant client.
 */
export function LogoutButton({
  className = "",
  variant = "solid",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      void signOut();
    });
  }

  const baseClasses =
    "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent";
  const variantClasses =
    variant === "ghost"
      ? "text-slate-300 hover:text-white hover:bg-white/10 focus:ring-offset-dark-end"
      : "bg-accent text-dark-start hover:bg-accent/90 focus:ring-offset-dark-end";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${baseClasses} ${variantClasses} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
    >
      {isPending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}

