"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * @component LoginForm
 * @description Fournit un formulaire de connexion pour les utilisateurs avec email/mot de passe,
 * ainsi qu'une option de connexion via Google.
 * Gère localement l'état du formulaire pour afficher les messages d'erreur et le statut de chargement.
 * @returns {JSX.Element} Le composant du formulaire de connexion.
 */
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsPending(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/app",
    });

    if (res?.error) {
      setError("Identifiants invalides");
      setIsPending(false);
      return;
    }

    router.push(res?.url ?? "/app");
    router.refresh();
  };

  return (
    <main className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" required className="border p-2" />
        <input name="password" type="password" placeholder="Mot de passe" required className="border p-2" />
        <button type="submit" className="bg-primary text-white px-4 py-2 disabled:opacity-60" disabled={isPending}>
          {isPending ? "Connexion..." : "Se connecter"}
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
