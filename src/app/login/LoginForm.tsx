"use client";

import { useActionState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

type State = string | null;

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/app";
  const [error, formAction, isPending] = useActionState<State, FormData>(loginAction, null);
  const [submitting, startTransition] = useTransition();

  return (
    <main className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      <form
        action={(fd) =>
          startTransition(async () => {
            const err = await formAction(fd);
            if (!err) router.replace(callbackUrl);
          })
        }
        className="flex flex-col gap-4"
      >
        <input name="email" type="email" placeholder="Email" required className="border p-2" />
        <input name="password" type="password" placeholder="Mot de passe" required className="border p-2" />
        <button type="submit" className="bg-primary text-white px-4 py-2 disabled:opacity-60" disabled={isPending || submitting}>
          {isPending || submitting ? "Connexion..." : "Se connecter"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
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
      <div className="mt-4 text-sm">
        <a href="/register" className="underline">Créer un compte</a>
        <span className="mx-2">•</span>
        <a href="/forgot-password" className="underline">Mot de passe oublié ?</a>
      </div>
    </main>
  );
}
