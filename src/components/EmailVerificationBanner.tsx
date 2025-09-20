"use client";

import { resendVerificationEmail } from "@/app/actions/resendVerificationEmail";
import { useTransition } from "react";

export function EmailVerificationBanner() {
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      await resendVerificationEmail();
    });
  };

  return (
    <div className="bg-yellow-200 text-yellow-800 p-2 text-center text-sm">
      <span>Veuillez vérifier votre adresse email.</span>
      <button onClick={handleResend} disabled={isPending} className="ml-2 underline disabled:opacity-60">
        {isPending ? "Envoi..." : "Renvoyer l'email"}
      </button>
    </div>
  );
}
