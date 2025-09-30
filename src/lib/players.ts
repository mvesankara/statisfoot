import { z, type infer as zInfer } from "./zod";

const FIRST_NAME_MAX_LENGTH = 60;
const LAST_NAME_MAX_LENGTH = 80;
const MIN_NAME_LENGTH = 2;

export const POSITION_GROUP_VALUES = ["GK", "DF", "MF", "FW"] as const;
export type PositionGroupValue = (typeof POSITION_GROUP_VALUES)[number];

const POSITION_GROUP_LABELS: Record<PositionGroupValue, string> = {
  GK: "Gardien de but",
  DF: "Défenseur",
  MF: "Milieu",
  FW: "Attaquant",
};

function hasMinimumLength(value: string, minimum: number) {
  return value.trim().length >= minimum;
}

export const createPlayerSchema = z.object({
  firstName: z
    .string()
    .max(
      FIRST_NAME_MAX_LENGTH,
      `Le prénom ne peut pas dépasser ${FIRST_NAME_MAX_LENGTH} caractères.`
    )
    .refine(
      (value) => hasMinimumLength(value, MIN_NAME_LENGTH),
      `Le prénom doit contenir au moins ${MIN_NAME_LENGTH} caractères.`
    ),
  lastName: z
    .string()
    .max(
      LAST_NAME_MAX_LENGTH,
      `Le nom ne peut pas dépasser ${LAST_NAME_MAX_LENGTH} caractères.`
    )
    .refine(
      (value) => hasMinimumLength(value, MIN_NAME_LENGTH),
      `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères.`
    ),
  primaryPosition: z.enum(POSITION_GROUP_VALUES, {
    errorMap: () => ({ message: "Sélectionnez un poste principal valide." }),
  }),
});

export type CreatePlayerInput = zInfer<typeof createPlayerSchema>;

export function normalizePlayerInput(values: CreatePlayerInput) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
  return {
    firstName: normalize(values.firstName),
    lastName: normalize(values.lastName),
    primaryPosition: values.primaryPosition,
  } satisfies CreatePlayerInput;
}

export function formatPlayerName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
) {
  return [firstName, lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .join(" ");
}

export function formatPrimaryPosition(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const upperValue = value.toUpperCase() as (typeof POSITION_GROUP_VALUES)[number];
  return POSITION_GROUP_LABELS[upperValue] ?? value;
}
