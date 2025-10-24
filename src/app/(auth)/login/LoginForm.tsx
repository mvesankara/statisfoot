// src/app/(auth)/login/LoginForm.tsx
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/PasswordInput";

type State = string | null;

async function loginAction(_: State, formData: FormData): Promise<State> {
const email = String(formData.get("email") ?? "");
const password = String(formData.get("password") ?? "");
if (!email || !password) return "Veuillez remplir tous les champs";
const res = await signIn("credentials", { redirect: false, email, password });
if (!res) return "Erreur inattendue";
if (res.error) return "Identifiants invalides";
return null;
}


function normalizeCallbackUrl(raw: string | null): string {
  if (!raw) {
    return "/app";
  }

  if (raw.startsWith("/")) {
    // Disallow protocol-relative values such as "//malicious.com".
    return raw.startsWith("//") ? "/app" : raw;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : undefined;

  try {
    const parsed = origin ? new URL(raw, origin) : new URL(raw);
    if (origin && parsed.origin !== origin) {
      return "/app";
    }

    const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return nextPath || "/app";
  } catch {
    return "/app";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = normalizeCallbackUrl(search.get("callbackUrl"));
  const [error, formAction, isPending] = useActionState<State, FormData>(loginAction, null);
  const [submitting, startTransition] = useTransition();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (hasSubmitted && error === null && !isPending && !submitting) {
      setHasSubmitted(false);
      router.replace(callbackUrl);
    }
  }, [callbackUrl, error, hasSubmitted, isPending, router, submitting]);


  return (
    <form
      action={(fd) => {
        setHasSubmitted(true);
        startTransition(() => {
          formAction(fd);
        });
      }}
      className="mt-6 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="vous@exemple.com"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <PasswordInput name="password" placeholder="••••••••" required />

      <button
        type="submit"
        disabled={isPending || submitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {(isPending || submitting) && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        Se connecter
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}
