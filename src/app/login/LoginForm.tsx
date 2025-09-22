"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsPending(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Identifiants invalides.");
      setIsPending(false);
    } else if (result?.ok) {
      // Redirect to the dashboard on successful login
      router.push("/dashboard");
    }
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
