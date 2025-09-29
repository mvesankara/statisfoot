import { z, type infer as zInfer } from "./zod";

const NAME_MAX_LENGTH = 120;
const POSITION_MAX_LENGTH = 80;
const MIN_NAME_LENGTH = 3;
const MIN_POSITION_LENGTH = 2;

function hasMinimumLength(value: string, minimum: number) {
  return value.trim().length >= minimum;
}

export const createPlayerSchema = z.object({
  name: z
    .string()
    .max(NAME_MAX_LENGTH, `Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères.`)
    .refine(
      (value) => hasMinimumLength(value, MIN_NAME_LENGTH),
      `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères.`
    ),
  position: z
    .string()
    .max(POSITION_MAX_LENGTH, `Le poste ne peut pas dépasser ${POSITION_MAX_LENGTH} caractères.`)
    .refine(
      (value) => hasMinimumLength(value, MIN_POSITION_LENGTH),
      `Le poste doit contenir au moins ${MIN_POSITION_LENGTH} caractères.`
    ),
});

export type CreatePlayerInput = zInfer<typeof createPlayerSchema>;

export function normalizePlayerInput(values: CreatePlayerInput) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
  return {
    name: normalize(values.name),
    position: normalize(values.position),
  } satisfies CreatePlayerInput;
}
