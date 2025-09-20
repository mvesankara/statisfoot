// src/app/(auth)/register/page.tsx
"use client";
import { useActionState } from "react";
import { register, type State } from "@/app/register/actions";
import { PasswordInput } from "@/components/PasswordInput";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [error, formAction, isPending] = useActionState<State, FormData>(register, null);

  return (
    <>
      <h1 className="text-2xl font-semibold">Créer un compte</h1>
      <p className="text-sm text-slate-400 mt-1">Rejoignez Statisf<span className="text-brand-sky">is</span>foot.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm text-slate-300">Prénom</label>
            <input id="firstName" name="firstName" required
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-sky" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm text-slate-300">Nom</label>
            <input id="lastName" name="lastName" required
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-sky" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="country" className="text-sm text-slate-300">Pays</label>
          <select id="country" name="country"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-sky">
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="CA">Canada</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-slate-300">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-sky" />
        </div>

        <PasswordInput name="password" required />
        <PasswordInput name="confirmPassword" label="Confirmer le mot de passe" required />

        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm text-slate-300">Votre profil</label>
          <select id="role" name="role" defaultValue="SCOUT"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-sky">
            <option value="SCOUT">Scout</option>
            <option value="RECRUITER">Recruteur</option>
            <option value="AGENT">Agent</option>
          </select>
        </div>

        <button
          type="submit" disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-sky px-4 py-2 font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Création..." : "Créer mon compte"}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
      <div className="mt-4 flex items-center gap-4">
        <hr className="w-full" />
        <span className="text-sm text-slate-400">OU</span>
        <hr className="w-full" />
      </div>
      <div className="mt-4">
        <button
          onClick={() => signIn("google")}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-100 hover:opacity-90"
        >
          Continuer avec Google
        </button>
      </div>
    </>
  );
}
