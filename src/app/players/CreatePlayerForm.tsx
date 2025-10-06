"use client";

import { useActionState, useEffect, useRef } from "react";

import { createPlayer } from "@/app/players/actions";
import {
  initialCreatePlayerState,
  type CreatePlayerState,
} from "@/app/players/state";
import {
  POSITION_GROUP_VALUES,
  formatPrimaryPosition,
} from "@/lib/players";

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
            Renseignez le prénom, le nom de famille et sélectionnez le poste principal.
          </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm text-slate-300">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky"
          />
          {state.errors.firstName && (
            <p className="text-xs text-red-400">{state.errors.firstName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm text-slate-300">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky"
          />
          {state.errors.lastName && (
            <p className="text-xs text-red-400">{state.errors.lastName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="primaryPosition" className="text-sm text-slate-300">
            Poste principal
          </label>
          <select
            id="primaryPosition"
            name="primaryPosition"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky"
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un poste
            </option>
            {POSITION_GROUP_VALUES.map((value) => (
              <option key={value} value={value}>
                {formatPrimaryPosition(value)} ({value})
              </option>
            ))}
          </select>
          {state.errors.primaryPosition && (
            <p className="text-xs text-red-400">{state.errors.primaryPosition}</p>
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
