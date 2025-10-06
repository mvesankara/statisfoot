"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { formatPrimaryPosition } from "@/lib/players";

type PlayerOption = {
  id: string;
  displayName?: string;
  fullName: string;
  primaryPosition: string | null;
};

interface NewReportFormProps {
  players: PlayerOption[];
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

/**
 * @component NewReportForm
 * @description Formulaire client permettant de créer un rapport scout.
 */
export function NewReportForm({ players }: NewReportFormProps) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isPending, startTransition] = useTransition();

  const isDisabled = players.length === 0 || isPending;

  function resetForm() {
    setContent("");
    setStatus("draft");
    setFeedback({ type: "success", message: "Rapport sauvegardé avec succès." });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, content, status }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Impossible d'enregistrer le rapport.");
        }

        resetForm();
        router.refresh();
      } catch (error) {
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Une erreur inattendue est survenue.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-slate-900/50 p-8 ring-1 ring-white/10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Joueur observé
          <select
            value={playerId}
            onChange={(event) => setPlayerId(event.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={players.length === 0}
          >
            {players.map((player) => {
              const label = player.displayName || player.fullName;
              return (
                <option key={player.id} value={player.id}>
                  {label}
                  {player.primaryPosition
                    ? ` · ${formatPrimaryPosition(player.primaryPosition)} (${player.primaryPosition})`
                    : ""}
                </option>
              );
            })}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Statut
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="draft">Brouillon</option>
            <option value="review">À relire</option>
            <option value="published">Publié</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Contenu du rapport
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Consignez ici vos observations détaillées, les axes de progression et les recommandations."
          minLength={20}
          rows={8}
          className="resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-sm leading-6 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
      </label>

      {feedback && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {players.length === 0 && (
        <p className="text-sm text-rose-200">
          Aucun joueur n’est disponible pour le moment. Ajoutez d’abord des joueurs
          avant de créer un rapport.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2 text-sm font-semibold text-dark-start transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Enregistrement…" : "Enregistrer le rapport"}
        </button>
        <button
          type="button"
          onClick={() => setContent("")}
          className="text-sm font-medium text-slate-400 hover:text-white"
        >
          Effacer le contenu
        </button>
      </div>
    </form>
  );
}

