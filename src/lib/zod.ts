export type ZodIssue = {
  path: (string | number)[];
  message: string;
};

export class ZodError extends Error {
  issues: ZodIssue[];

  constructor(issues: ZodIssue[]) {
    super("Invalid input");
    this.issues = issues;
  }
}

export type SafeParseSuccess<T> = {
  success: true;
  data: T;
};

export type SafeParseError = {
  success: false;
  error: { issues: ZodIssue[] };
};

export type SafeParseReturn<T> = SafeParseSuccess<T> | SafeParseError;

function clonePath(path: (string | number)[]): (string | number)[] {
  return [...path];
}

export abstract class ZodType<T> {
  readonly _type!: T;

  optional(): ZOptional<T> {
    return new ZOptional(this);
  }

  parse(value: unknown): T {
    const result = this.safeParse(value);
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
    return result.data;
  }

  safeParse(value: unknown): SafeParseReturn<T> {
    const issues: ZodIssue[] = [];
    const data = this._parse(value, issues, []);
    if (issues.length > 0) {
      return { success: false, error: { issues } };
    }
    return { success: true, data: data as T };
  }

  public abstract _parse(
    value: unknown,
    issues: ZodIssue[],
    path: (string | number)[]
  ): T | undefined;
}

class ZOptional<T> extends ZodType<T | undefined> {
  constructor(private inner: ZodType<T>) {
    super();
  }

  public _parse(value: unknown, issues: ZodIssue[], path: (string | number)[]) {
    if (value === undefined || value === null) {
      return undefined;
    }
    return this.inner._parse(value, issues, path);
  }
}

type StringCheck = (value: string) => string | null;

class ZString extends ZodType<string> {
  private checks: StringCheck[] = [];
  private requiredError?: string;

  constructor(requiredError?: string) {
    super();
    this.requiredError = requiredError;
  }

  min(length: number, message?: string) {
    this.checks.push((value) =>
      value.length >= length ? null : message || `Doit contenir au moins ${length} caractères`
    );
    return this;
  }

  max(length: number, message?: string) {
    this.checks.push((value) =>
      value.length <= length ? null : message || `Doit contenir au maximum ${length} caractères`
    );
    return this;
  }

  regex(regex: RegExp, message?: string) {
    this.checks.push((value) => (regex.test(value) ? null : message || "Format invalide"));
    return this;
  }

  refine(check: (value: string) => boolean, message: string) {
    this.checks.push((value) => (check(value) ? null : message));
    return this;
  }

  public _parse(value: unknown, issues: ZodIssue[], path: (string | number)[]) {
    if (typeof value !== "string") {
      issues.push({ path: clonePath(path), message: this.requiredError || "Valeur invalide" });
      return undefined;
    }

    for (const check of this.checks) {
      const result = check(value);
      if (result) {
        issues.push({ path: clonePath(path), message: result });
      }
    }

    return value;
  }
}

class ZEnum<T extends readonly [string, ...string[]]> extends ZodType<T[number]> {
  private readonly options: T[number][];
  private readonly message?: string;

  constructor(values: T, message?: string) {
    super();
    this.options = [...values];
    this.message = message;
  }

  public _parse(value: unknown, issues: ZodIssue[], path: (string | number)[]) {
    if (typeof value !== "string" || !this.options.includes(value)) {
      issues.push({ path: clonePath(path), message: this.message || "Valeur non autorisée" });
      return undefined;
    }
    return value as T[number];
  }
}

type ZodRawShape = { [key: string]: ZodType<unknown> };

class ZObject<Shape extends ZodRawShape> extends ZodType<{ [K in keyof Shape]: Shape[K]["_type"] }> {
  constructor(private readonly shape: Shape) {
    super();
  }

  public _parse(value: unknown, issues: ZodIssue[], path: (string | number)[]) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      issues.push({ path: clonePath(path), message: "Objet invalide" });
      return undefined;
    }

    const result: Record<string, unknown> = {};
    const source = value as Record<string, unknown>;

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const childValue = source[key];
      const parsed = schema._parse(childValue, issues, [...path, key]);
      result[key] = parsed;
    }

    return result as { [K in keyof Shape]: Shape[K]["_type"] };
  }
}

export const z = {
  string: () => new ZString(),
  enum: <T extends readonly [string, ...string[]]>(values: T) => new ZEnum(values),
  object: <Shape extends ZodRawShape>(shape: Shape) => new ZObject(shape),
};

export type infer<T extends ZodType<unknown>> = T["_type"];
