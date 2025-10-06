import { z, infer as inferType } from "../../../lib/zod";

type FetchResponse = Pick<Response, "ok" | "json">;
export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<FetchResponse>;

export const RECOMMENDATIONS = [
  { value: "sign", label: "Recommander la signature" },
  { value: "monitor", label: "Surveiller régulièrement" },
  { value: "wait", label: "À revoir plus tard" },
  { value: "avoid", label: "Ne pas recommander" },
] as const;

type RecommendationValue = (typeof RECOMMENDATIONS)[number]["value"];

const recommendationValues = RECOMMENDATIONS.map((option) => option.value) as RecommendationValue[];

const ratingField = z
  .string()
  .refine((value) => {
    if (value.trim().length === 0) return true;
    const numeric = Number(value);
    return Number.isInteger(numeric) && numeric >= 0 && numeric <= 10;
  }, "La note doit être un entier entre 0 et 10")
  .optional();

const longTextField = z
  .string()
  .max(5000, "Le texte est trop long")
  .optional();

export const reportSchema = z.object({
  playerId: z.string().min(1, "Sélectionnez un joueur"),
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(255, "Titre trop long"),
  content: z
    .string()
    .min(20, "Les observations doivent contenir au moins 20 caractères")
    .max(5000, "Les observations sont trop longues"),
  rating: ratingField,
  strengths: longTextField,
  weaknesses: longTextField,
  recommendation: z
    .string()
    .refine(
      (value) => value.trim().length === 0 || recommendationValues.includes(value as RecommendationValue),
      "Choisissez une recommandation valide"
    )
    .optional(),
  matchDate: z
    .string()
    .refine((value) => {
      if (value.trim().length === 0) return true;
      const parsed = new Date(value);
      return !Number.isNaN(parsed.getTime());
    }, "Date de match invalide")
    .optional(),
});

export type ReportFormValues = inferType<typeof reportSchema>;

export function buildReportPayload(values: ReportFormValues) {
  const rating = values.rating && values.rating.trim().length > 0 ? Number(values.rating) : undefined;
  const matchDate = values.matchDate && values.matchDate.trim().length > 0 ? values.matchDate : undefined;

  return {
    playerId: values.playerId,
    title: values.title,
    content: values.content,
    rating,
    strengths: values.strengths && values.strengths.trim().length > 0 ? values.strengths : undefined,
    weaknesses: values.weaknesses && values.weaknesses.trim().length > 0 ? values.weaknesses : undefined,
    recommendation:
      values.recommendation && values.recommendation.trim().length > 0
        ? values.recommendation
        : undefined,
    matchDate: matchDate ?? undefined,
  };
}

export async function submitReport(
  values: ReportFormValues,
  fetchImpl: FetchLike = fetch
) {
  const payload = buildReportPayload(values);
  const response = await fetchImpl("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error ?? "Impossible d'enregistrer le rapport");
  }

  return payload;
}
