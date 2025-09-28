import { ZodType } from "./zod";
import type { FieldErrors, Resolver } from "./react-hook-form";

function buildErrors(issues: { path: (string | number)[]; message: string }[]): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    result[key] = { message: issue.message };
  }
  return result;
}

export function zodResolver<TValues>(schema: ZodType<TValues>): Resolver<TValues> {
  return async (values: any) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data, errors: {} };
    }

    return {
      values: values as TValues,
      errors: buildErrors(parsed.error.issues),
    };
  };
}
