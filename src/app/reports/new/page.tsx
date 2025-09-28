"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  REPORT_CRITERIA,
  RECOMMENDATIONS,
  STATUS_OPTIONS,
  buildEmptyNotes,
  reportSchema,
  submitReport,
  type AttachmentDescriptor,
  type ReportFormValues,
} from "./form-utils";

type PlayerOption = {
  id: string;
  label: string;
  position?: string;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

function formatPlayerLabel(player: any): string {
  if (player?.name) return player.name;
  const parts = [player?.firstname, player?.lastname].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (player?.firstName || player?.lastName) {
    return [player?.firstName, player?.lastName].filter(Boolean).join(" ");
  }
  return player?.id ?? "Joueur";
}

export default function NewReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const initialPlayerId = searchParams?.get("playerId") ?? "";

  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

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

  const defaultNotes = useMemo(() => buildEmptyNotes(), []);

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
      summary: "",
      notes: defaultNotes,
      recommendation: "",
      status: "draft",
      analysis: "",
    },
  });

  useEffect(() => {
    if (initialPlayerId) {
      setValue("playerId", initialPlayerId);
    }
  }, [initialPlayerId, setValue]);

  const fetchPlayers = useCallback(async () => {
    setPlayersLoading(true);
    setPlayersError(null);
    try {
      const response = await fetch("/api/players");
      if (!response.ok) {
        throw new Error("Erreur réseau");
      }
      const payload = await response.json();
      if (!Array.isArray(payload)) {
        throw new Error("Réponse inattendue");
      }
      const nextPlayers = payload.map((player: any) => ({
        id: player.id,
        label: formatPlayerLabel(player),
        position: player.position ?? player.role ?? undefined,
      }));
      if (isMounted.current) {
        setPlayers(nextPlayers);
      }
    } catch (error) {
      if (isMounted.current) {
        setPlayersError("Impossible de charger la liste des joueurs.");
        setPlayers([]);
      }
    } finally {
      if (isMounted.current) {
        setPlayersLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const onSubmit = async (values: ReportFormValues) => {
    setSubmitError(null);
    setToast(null);

    const attachmentMetadata: AttachmentDescriptor[] = attachments.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    try {
      await submitReport(values, attachmentMetadata);

      setToast({ type: "success", message: "Rapport enregistré avec succès." });
      reset({
        playerId: values.playerId,
        title: "",
        summary: "",
        notes: buildEmptyNotes(),
        recommendation: "",
        status: values.status,
        analysis: "",
      });
      setAttachments([]);

      redirectTimeout.current = setTimeout(() => {
        router.push(`/players/${values.playerId}`);
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setSubmitError(message);
      setToast({ type: "error", message });
    }
  };

  const handleAttachmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setAttachments(files);
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

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Nouveau rapport</h1>
        <p className="text-sm text-gray-600">
          Rédigez un rapport détaillé pour partager vos observations avec le staff.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="playerId" className="mb-1 block text-sm font-medium text-gray-700">
                Joueur évalué
              </label>
              <select
                id="playerId"
                {...register("playerId")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={playersLoading}
              >
                <option value="">Sélectionnez un joueur</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.label}
                    {player.position ? ` · ${player.position}` : ""}
                  </option>
                ))}
              </select>
              {playersLoading && (
                <p className="mt-1 text-xs text-gray-500">Chargement des joueurs…</p>
              )}
              {playersError && (
                <div className="mt-1 text-xs text-red-600">
                  <p>{playersError}</p>
                  <button
                    type="button"
                    className="mt-1 font-medium text-primary hover:underline"
                    onClick={() => fetchPlayers()}
                  >
                    Réessayer
                  </button>
                </div>
              )}
              {errors["playerId"] && (
                <p className="mt-1 text-xs text-red-600">{errors["playerId"].message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors["status"] && (
                <p className="mt-1 text-xs text-red-600">{errors["status"].message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Titre du rapport
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ex : Performance vs. FC Nantes"
            />
            {errors["title"] && (
              <p className="mt-1 text-xs text-red-600">{errors["title"].message}</p>
            )}
          </div>

          <div>
            <label htmlFor="summary" className="mb-1 block text-sm font-medium text-gray-700">
              Résumé
            </label>
            <textarea
              id="summary"
              rows={4}
              {...register("summary")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Synthétisez les points clés de la prestation."
            />
            {errors["summary"] && (
              <p className="mt-1 text-xs text-red-600">{errors["summary"].message}</p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-800">Notes par critère</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {REPORT_CRITERIA.map((criterion) => {
                const fieldName = `notes.${criterion.key}`;
                return (
                  <div key={criterion.key}>
                    <label
                      htmlFor={fieldName}
                      className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600"
                    >
                      {criterion.label}
                    </label>
                    <input
                      id={fieldName}
                      type="number"
                      step="0.5"
                      min={0}
                      max={10}
                      {...register(fieldName)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors[fieldName] && (
                      <p className="mt-1 text-xs text-red-600">{errors[fieldName].message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="recommendation" className="mb-1 block text-sm font-medium text-gray-700">
                Recommandation
              </label>
              <select
                id="recommendation"
                {...register("recommendation")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Sélectionnez une recommandation</option>
                {RECOMMENDATIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors["recommendation"] && (
                <p className="mt-1 text-xs text-red-600">{errors["recommendation"].message}</p>
              )}
            </div>

            <div>
              <label htmlFor="analysis" className="mb-1 block text-sm font-medium text-gray-700">
                Observations détaillées
              </label>
              <textarea
                id="analysis"
                rows={4}
                {...register("analysis")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ajoutez des éléments spécifiques : attitude, contexte, axes de progression…"
              />
              {errors["analysis"] && (
                <p className="mt-1 text-xs text-red-600">{errors["analysis"].message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="attachments" className="mb-1 block text-sm font-medium text-gray-700">
              Pièces jointes (optionnel)
            </label>
            <input
              id="attachments"
              type="file"
              multiple
              onChange={handleAttachmentsChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
            />
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                {attachments.map((file) => (
                  <li key={file.name + file.size}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => {
                reset({
                  playerId: initialPlayerId,
                  title: "",
                  summary: "",
                  notes: buildEmptyNotes(),
                  recommendation: "",
                  status: "draft",
                  analysis: "",
                });
                setAttachments([]);
              }}
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || playersLoading}
            >
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
