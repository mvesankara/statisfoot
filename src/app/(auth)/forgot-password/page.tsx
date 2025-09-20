// src/app/(auth)/forgot-password/page.tsx
"use client";
import { useActionState } from "react";
import { forgotPassword, type State } from "@/app/forgot-password/actions";

export default function ForgotPasswordPage() {
  const [message, formAction, isPending] = useActionState<State, FormData>(forgotPassword, null);

  return (
    <>
      <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
      <p className="text-sm text-slate-400 mt-1">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-slate-300">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-sky" />
        </div>

        <button
          type="submit" disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-sky px-4 py-2 font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Envoi..." : "Envoyer le lien"}
        </button>

        {message && <p className="text-sm text-green-400">{message}</p>}
      </form>
    </>
  );
}
