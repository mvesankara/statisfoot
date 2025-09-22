"use client";

import { resendVerificationEmail } from "@/app/actions/resendVerificationEmail";
import { useTransition } from "react";

/**
 * @component EmailVerificationBanner
 * @description Affiche une bannière invitant l'utilisateur à vérifier son adresse e-mail.
 * La bannière contient un bouton pour renvoyer l'e-mail de vérification.
 * @returns {JSX.Element} Le composant de la bannière de vérification d'e-mail.
 */
export function EmailVerificationBanner() {
  const [isPending, startTransition] = useTransition();

  /**
   * @function handleResend
   * @description Gère le clic sur le bouton "Renvoyer l'email".
   * Appelle la Server Action `resendVerificationEmail` dans une transition pour éviter de bloquer l'interface utilisateur.
   */
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
