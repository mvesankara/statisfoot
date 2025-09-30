import type { CreatePlayerInput } from "@/lib/players";

export type CreatePlayerState = {
  success: boolean;
  errors: Partial<Record<keyof CreatePlayerInput, string>>;
  message: string | null;
};

export const initialCreatePlayerState: CreatePlayerState = {
  success: false,
  errors: {},
  message: null,
};
