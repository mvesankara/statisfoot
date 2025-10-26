// src/app/(auth)/reset-password/page.tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword, type State } from "@/app/reset-password/actions";
import { PasswordInput } from "@/components/PasswordInput";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * @page ResetPasswordPage
 * @description Page de réinitialisation du mot de passe.
 * Affiche un formulaire où l'utilisateur peut entrer et confirmer son nouveau mot de passe.
 * Le jeton de réinitialisation est lu depuis les paramètres de l'URL.
 * @returns {JSX.Element} Le composant de la page de réinitialisation de mot de passe.
 */
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState<State>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setMessage(null);

    try {
      const result = await resetPassword(null, formData);
      setMessage(result);
    } catch (err) {
      if (isRedirectError(err)) {
        throw err;
      }

      console.error("Erreur lors de la réinitialisation du mot de passe", err);
      setMessage("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold">Réinitialiser le mot de passe</h1>
      <p className="text-sm text-slate-400 mt-1">
        Entrez votre nouveau mot de passe.
      </p>

      <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="token" value={token ?? ""} />
        <PasswordInput name="password" />
        <PasswordInput name="confirmPassword" label="Confirmer le mot de passe" />

        <button
          type="submit" disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-sky px-4 py-2 font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>

        {message && <p className="text-sm text-red-400">{message}</p>}
      </form>
    </>
  );
}
