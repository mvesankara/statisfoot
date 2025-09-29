import { z, infer as inferType } from "../../../lib/zod";

export const REPORT_CRITERIA = [
  { key: "technique", label: "Technique" },
  { key: "physique", label: "Physique" },
  { key: "tactique", label: "Tactique" },
  { key: "mental", label: "Mental" },
  { key: "potentiel", label: "Potentiel" },
] as const;

export type CriteriaKey = (typeof REPORT_CRITERIA)[number]["key"];

export const RECOMMENDATIONS = [
  { value: "sign", label: "Recommander la signature" },
  { value: "monitor", label: "Surveiller régulièrement" },
  { value: "wait", label: "À revoir plus tard" },
  { value: "avoid", label: "Ne pas recommander" },
] as const;

export const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
] as const;

type RecommendationValue = (typeof RECOMMENDATIONS)[number]["value"];
type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const recommendationValues = RECOMMENDATIONS.map((option) => option.value) as RecommendationValue[];
const statusValues = STATUS_OPTIONS.map((option) => option.value) as StatusValue[];

const noteField = z
  .string()
  .min(1, "La note est requise")
  .refine((value) => !Number.isNaN(Number(value)), "La note doit être un nombre")
  .refine(
    (value) => {
      const numeric = Number(value);
      return numeric >= 0 && numeric <= 10;
    },
    "La note doit être comprise entre 0 et 10"
  );

export const reportSchema = z.object({
  playerId: z.string().min(1, "Sélectionnez un joueur"),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(120, "Titre trop long"),
  summary: z
    .string()
    .min(20, "Le résumé doit contenir au moins 20 caractères")
    .max(1000, "Le résumé est trop long"),
  notes: z.object(
    REPORT_CRITERIA.reduce((shape, criterion) => {
      return { ...shape, [criterion.key]: noteField };
    }, {} as Record<CriteriaKey, typeof noteField>)
  ),
  recommendation: z
    .string()
    .min(1, "Choisissez une recommandation")
    .refine(
      (value) => recommendationValues.includes(value as RecommendationValue),
      "Choisissez une recommandation"
    ),
  status: z
    .string()
    .min(1, "Choisissez un statut")
    .refine((value) => statusValues.includes(value as StatusValue), "Choisissez un statut"),
  analysis: z.string().max(5000, "Les observations sont trop longues").optional(),
});

export type ReportFormValues = inferType<typeof reportSchema>;

export type AttachmentDescriptor = {
  name: string;
  size: number;
  type: string;
};

export function buildEmptyNotes(): Record<CriteriaKey, string> {
  return REPORT_CRITERIA.reduce((acc, criterion) => {
    acc[criterion.key] = "";
    return acc;
  }, {} as Record<CriteriaKey, string>);
}

export function buildReportPayload(
  values: ReportFormValues,
  attachments: AttachmentDescriptor[]
) {
  const numericNotes = Object.entries(values.notes).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      acc[key] = Number(value);
      return acc;
    },
    {}
  );

  return {
    playerId: values.playerId,
    title: values.title,
    content: JSON.stringify({
      summary: values.summary,
      notes: numericNotes,
      recommendation: values.recommendation,
      analysis: values.analysis ?? "",
      attachments,
    }),
    status: values.status,
  };
}

export async function submitReport(
  values: ReportFormValues,
  attachments: AttachmentDescriptor[],
  fetchImpl: typeof fetch = fetch
) {
  const payload = buildReportPayload(values, attachments);
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
