"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatPlayerName,
  formatPrimaryPosition,
} from "@/lib/players";
import { RECOMMENDATIONS, reportSchema, submitReport, type ReportFormValues } from "./form-utils";

type PlayerOption = {
  id: string;
  label: string;
  primaryPosition?: string | null;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

type PlayerListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryPosition: string | null;
  fullName?: string | null;
};

type NewReportPageClientProps = {
  initialPlayers: PlayerListItem[];
  canListPlayers: boolean;
};

function formatPlayerLabel(player: {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}): string {
  if (player?.fullName) return player.fullName;
  const label = formatPlayerName(player?.firstName, player?.lastName);
  return label.length > 0 ? label : player?.id ?? "Joueur";
}

function mapPlayersToOptions(payload: PlayerListItem[]): PlayerOption[] {
  return payload.map((player) => ({
    id: player.id,
    label: formatPlayerLabel(player),
    primaryPosition: player.primaryPosition,
  }));
}

export function NewReportPageClient({
  initialPlayers,
  canListPlayers,
}: NewReportPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const initialPlayerId = searchParams?.get("playerId") ?? "";

  const initialPlayerOptions = useMemo(
    () => mapPlayersToOptions(initialPlayers),
    [initialPlayers]
  );

  const [players, setPlayers] = useState<PlayerOption[]>(initialPlayerOptions);
  const [playersLoading, setPlayersLoading] = useState(
    canListPlayers && initialPlayers.length === 0
  );
  const [playersError, setPlayersError] = useState<string | null>(
    canListPlayers ? null : "Vous n’avez pas les permissions pour voir les joueurs."
  );
  const [toast, setToast] = useState<ToastState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      playerId: initialPlayerId,
      title: "",
      content: "",
      rating: "",
      strengths: "",
      weaknesses: "",
      recommendation: "",
      matchDate: "",
    },
  });

  useEffect(() => {
    if (initialPlayerId) {
      setValue("playerId", initialPlayerId);
    }
  }, [initialPlayerId, setValue]);

  const fetchPlayers = useCallback(async () => {
    if (!canListPlayers) {
      return;
    }
    setPlayersLoading(true);
    setPlayersError(null);
    try {
      const response = await fetch("/api/players");
      if (response.status === 401 || response.status === 403) {
        if (isMounted.current) {
          setPlayersError("Vous n’avez pas les permissions pour voir les joueurs.");
          setPlayers(initialPlayerOptions);
        }
        return;
      }
      if (!response.ok) {
        throw new Error("Erreur réseau");
      }
      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload)) {
        throw new Error("Réponse inattendue");
      }
      const nextPlayers = mapPlayersToOptions(payload as PlayerListItem[]);
      if (isMounted.current) {
        setPlayers(nextPlayers);
      }
    } catch {
      if (isMounted.current) {
        setPlayersError("Impossible de charger la liste des joueurs.");
        setPlayers(initialPlayerOptions);
      }
    } finally {
      if (isMounted.current) {
        setPlayersLoading(false);
      }
    }
  }, [canListPlayers, initialPlayerOptions]);

  useEffect(() => {
    if (canListPlayers) {
      fetchPlayers();
    } else {
      setPlayersLoading(false);
    }
  }, [canListPlayers, fetchPlayers]);

  const onSubmit = async (values: ReportFormValues) => {
    setSubmitError(null);
    setToast(null);

    try {
      await submitReport(values);

      setToast({ type: "success", message: "Rapport enregistré avec succès." });
      reset({
        playerId: values.playerId,
        title: "",
        content: "",
        rating: "",
        strengths: "",
        weaknesses: "",
        recommendation: "",
        matchDate: "",
      });

      redirectTimeout.current = setTimeout(() => {
        router.push(`/players/${values.playerId}`);
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setSubmitError(message);
      setToast({ type: "error", message });
    }
  };

  if (sessionStatus === "loading") {
    return <div className="p-8 text-center text-sm text-gray-500">Chargement de la session...</div>;
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Vous devez être connecté pour rédiger un rapport.
      </div>
    );
  }

  const authorLabel = session?.user?.name || session?.user?.email || "Utilisateur";

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 p-6">
      {toast && (
        <div
          role="status"
          className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 shadow-lg transition ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="space-y-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-white/80">
          Rédaction de rapport
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Nouveau rapport
        </h1>
        <p className="text-sm text-white/90">
          Rédigez un rapport détaillé pour partager vos observations avec le staff.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-lg">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Auteur</p>
            <p className="text-sm font-medium text-gray-900">{authorLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Statut du rapport</p>
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.role ?? "Scout"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="playerId"
                className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-800"
              >
                Joueur évalué
                <span aria-hidden="true" className="text-danger">
                  *
                </span>
              </label>
              <select
                id="playerId"
                {...register("playerId")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={(playersLoading && players.length === 0) || !canListPlayers}
              >
                <option value="">Sélectionnez un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.label}
                    {player.primaryPosition
                      ? ` · ${formatPrimaryPosition(player.primaryPosition)} (${player.primaryPosition})`
                      : ""}
                  </option>
                ))}
              </select>
              {playersLoading && players.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">Chargement des joueurs…</p>
              )}
              {playersError && (
                <div className="mt-1 text-xs text-red-600">
                  <p>{playersError}</p>
                  {canListPlayers && (
                    <button
                      type="button"
                      className="mt-1 font-medium text-primary hover:underline"
                      onClick={() => fetchPlayers()}
                    >
                      Réessayer
                    </button>
                  )}
                </div>
              )}
              {!playersLoading && canListPlayers && players.length === 0 && !playersError && (
                <p className="mt-1 text-xs text-gray-500">
                  Aucun joueur n’est encore disponible. Ajoutez un joueur pour pouvoir rédiger un rapport.
                </p>
              )}
              {errors.playerId && (
                <p className="mt-1 text-xs text-red-600">{errors.playerId.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="matchDate"
                className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                Date du match
                <span className="text-xs font-normal text-gray-500">(optionnel)</span>
              </label>
              <input
                id="matchDate"
                type="date"
                {...register("matchDate")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.matchDate && (
                <p className="mt-1 text-xs text-red-600">{errors.matchDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-800"
            >
              Titre du rapport
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ex : Performance vs. FC Nantes"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-800"
            >
              Observations générales
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </label>
            <textarea
              id="content"
              rows={6}
              {...register("content")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Décrivez le contexte du match, l’attitude du joueur, ses points marquants…"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="rating"
                className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                Note globale (0 à 10)
                <span className="text-xs font-normal text-gray-500">(optionnel)</span>
              </label>
              <input
                id="rating"
                type="number"
                min={0}
                max={10}
                step={1}
                {...register("rating")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex : 7"
              />
              {errors.rating && (
                <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="recommendation"
                className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                Recommandation
                <span className="text-xs font-normal text-gray-500">(optionnel)</span>
              </label>
              <select
                id="recommendation"
                {...register("recommendation")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Sélectionnez une recommandation</option>
                {RECOMMENDATIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.recommendation && (
                <p className="mt-1 text-xs text-red-600">{errors.recommendation.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="strengths"
                className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                Points forts
                <span className="text-xs font-normal text-gray-500">(optionnel)</span>
              </label>
              <textarea
                id="strengths"
                rows={4}
                {...register("strengths")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex : vision du jeu, qualité de passe…"
              />
              {errors.strengths && (
                <p className="mt-1 text-xs text-red-600">{errors.strengths.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="weaknesses"
                className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                Axes d’amélioration
                <span className="text-xs font-normal text-gray-500">(optionnel)</span>
              </label>
              <textarea
                id="weaknesses"
                rows={4}
                {...register("weaknesses")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex : intensité défensive, concentration…"
              />
              {errors.weaknesses && (
                <p className="mt-1 text-xs text-red-600">{errors.weaknesses.message}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
              onClick={() => {
                reset({
                  playerId: initialPlayerId,
                  title: "",
                  content: "",
                  rating: "",
                  strengths: "",
                  weaknesses: "",
                  recommendation: "",
                  matchDate: "",
                });
              }}
            >
              Réinitialiser
            </button>
            {/**
             * Le bouton d'enregistrement doit rester accessible tant qu'un joueur est sélectionné,
             * même si la liste des joueurs est en cours d'actualisation. On ne le désactive donc que
             * lorsque la soumission est en cours ou qu'aucun joueur n'est encore disponible.
             */}
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={
                isSubmitting || (playersLoading && players.length === 0)
              }
            >
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
