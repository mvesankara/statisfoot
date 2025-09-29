"use client";

import { useActionState, useEffect, useRef } from "react";

import { createPlayer } from "@/app/players/actions";
import {
  initialCreatePlayerState,
  type CreatePlayerState,
} from "@/app/players/state";

export function CreatePlayerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<CreatePlayerState, FormData>(
    createPlayer,
    initialCreatePlayerState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Ajouter un joueur</h2>
        <p className="text-sm text-slate-400">
          Renseignez le nom complet du joueur et son poste principal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm text-slate-300">
            Nom complet
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky"
          />
          {state.errors.name && (
            <p className="text-xs text-red-400">{state.errors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="position" className="text-sm text-slate-300">
            Poste principal
          </label>
          <input
            id="position"
            name="position"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky"
          />
          {state.errors.position && (
            <p className="text-xs text-red-400">{state.errors.position}</p>
          )}
        </div>
      </div>

      {state.message && (
        <p
          className={`text-sm ${state.success ? "text-emerald-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-sky px-4 py-2 text-sm font-medium text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Ajout en cours..." : "Ajouter le joueur"}
        </button>
      </div>
    </form>
  );
}

export default CreatePlayerForm;
