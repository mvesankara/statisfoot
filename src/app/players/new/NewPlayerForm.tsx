"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  POSITION_GROUP_VALUES,
  createPlayerSchema,
  formatPrimaryPosition,
  normalizePlayerInput,
  type CreatePlayerInput,
} from "@/lib/players";

type FeedbackState =
  | { type: "success" | "error"; message: string }
  | null;

type ServerFieldErrors = Record<string, string[]>;

export function NewPlayerForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ServerFieldErrors | null>(null);
  const [createdPlayerId, setCreatedPlayerId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      primaryPosition: "" as unknown as CreatePlayerInput["primaryPosition"],
    },
  });

  const registerField = <Name extends keyof CreatePlayerInput>(name: Name) =>
    register(name) as unknown as Record<string, unknown>;

  const onSubmit = async (values: CreatePlayerInput) => {
    setFeedback(null);
    setServerFieldErrors(null);
    setCreatedPlayerId(null);

    const payload = normalizePlayerInput(values);

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const content = await response.json().catch(() => ({}));
        if (content?.fieldErrors && typeof content.fieldErrors === "object") {
          setServerFieldErrors(content.fieldErrors as ServerFieldErrors);
        }
        const message =
          typeof content?.error === "string"
            ? content.error
            : "Impossible d'enregistrer ce joueur.";
        setFeedback({ type: "error", message });
        return;
      }

      const player = (await response.json()) as {
        id: string;
        firstName: string | null;
        lastName: string | null;
      };
      setFeedback({ type: "success", message: "Le joueur a été ajouté avec succès." });
      setCreatedPlayerId(player.id);
      reset({
        firstName: "",
        lastName: "",
        primaryPosition: "" as unknown as CreatePlayerInput["primaryPosition"],
      });
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "Une erreur inattendue est survenue lors de l'enregistrement.",
      });
    }
  };

  const firstNameError = errors.firstName?.message;
  const lastNameError = errors.lastName?.message;
  const primaryPositionError = errors.primaryPosition?.message;

  const serverFirstNameError = serverFieldErrors?.firstName?.[0];
  const serverLastNameError = serverFieldErrors?.lastName?.[0];
  const serverPrimaryPositionError = serverFieldErrors?.primaryPosition?.[0];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl bg-slate-900/50 p-8 shadow-lg ring-1 ring-white/10"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Prénom
          <input
            {...registerField("firstName")}
            type="text"
            placeholder="Ex. Enzo"
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {(firstNameError || serverFirstNameError) && (
            <span className="text-xs text-rose-300">{firstNameError || serverFirstNameError}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Nom
          <input
            {...registerField("lastName")}
            type="text"
            placeholder="Ex. Leclerc"
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {(lastNameError || serverLastNameError) && (
            <span className="text-xs text-rose-300">{lastNameError || serverLastNameError}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Poste principal
          <select
            {...registerField("primaryPosition")}
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Sélectionnez un poste</option>
            {POSITION_GROUP_VALUES.map((value) => (
              <option key={value} value={value}>
                {formatPrimaryPosition(value)} ({value})
              </option>
            ))}
          </select>
          {(primaryPositionError || serverPrimaryPositionError) && (
            <span className="text-xs text-rose-300">
              {primaryPositionError || serverPrimaryPositionError}
            </span>
          )}
        </label>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          <p>{feedback.message}</p>
          {feedback.type === "success" && createdPlayerId && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <Link
                href={`/players/${createdPlayerId}`}
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Consulter la fiche du joueur
              </Link>
              <Link
                href="/players"
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Retour à la liste des joueurs
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2 text-sm font-semibold text-dark-start transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Enregistrement…" : "Ajouter le joueur"}
        </button>
        <button
          type="button"
          onClick={() => {
            reset({
              firstName: "",
              lastName: "",
              primaryPosition: "" as unknown as CreatePlayerInput["primaryPosition"],
            });
            setServerFieldErrors(null);
            setFeedback(null);
            setCreatedPlayerId(null);
          }}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
}
