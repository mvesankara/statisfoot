import { useCallback, useMemo, useRef, useState } from "react";

export type FieldError = {
  message: string;
};

export type FieldErrors = Record<string, FieldError>;

export type ResolverResult<TValues> = {
  values: TValues;
  errors: FieldErrors;
};

export type Resolver<TValues> = (
  values: any
) => Promise<ResolverResult<TValues>> | ResolverResult<TValues>;

export interface UseFormOptions<TValues> {
  defaultValues?: TValues;
  resolver?: Resolver<TValues>;
}

export interface RegisteredField {
  name: string;
  value: unknown;
  onChange: (event: React.ChangeEvent<any>) => void;
  onBlur: () => void;
}

export interface FormState {
  errors: FieldErrors;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
}

export interface UseFormReturn<TValues> {
  register: (name: string) => RegisteredField;
  handleSubmit: (
    onValid: (values: TValues) => void | Promise<void>
  ) => (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  formState: FormState;
  setValue: (name: string, value: unknown) => void;
  reset: (values?: Partial<TValues>) => void;
  getValues: () => TValues;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function setValueByPath(target: any, path: string, value: unknown) {
  const segments = path.split(".");
  let current = target;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
    } else {
      if (typeof current[segment] !== "object" || current[segment] === null) {
        current[segment] = {};
      }
      current = current[segment];
    }
  });
}

function getValueByPath(target: any, path: string): any {
  return path.split(".").reduce((acc, segment) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[segment];
  }, target);
}

function mergeDeep<T>(base: T, patch: Partial<T>): T {
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeDeep(result[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
}

export function useForm<TValues = Record<string, unknown>>(
  options: UseFormOptions<TValues> = {}
): UseFormReturn<TValues> {
  const { defaultValues, resolver } = options;
  const defaultRef = useRef<TValues>(clone(defaultValues || ({} as TValues)));
  const [values, setValues] = useState<TValues>(
    clone(defaultRef.current || ({} as TValues))
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const getValues = useCallback(() => clone(values), [values]);

  const updateValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => {
      const next = clone(prev);
      setValueByPath(next, name, value);
      return next;
    });
  }, []);

  const register = useCallback(
    (name: string): RegisteredField => {
      return {
        name,
        value: getValueByPath(values, name) ?? "",
        onChange: (event: React.ChangeEvent<any>) => {
          const target = event.target;
          const nextValue =
            target.type === "checkbox"
              ? target.checked
              : target.type === "file"
              ? target.files
              : target.value;
          updateValue(name, nextValue);
        },
        onBlur: () => {
          /* noop */
        },
      };
    },
    [values, updateValue]
  );

  const handleSubmit = useCallback(
    (onValid: (values: TValues) => void | Promise<void>) => {
      return async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setIsSubmitSuccessful(false);
        try {
          const currentValues = getValues();
          const result = resolver
            ? await resolver(currentValues)
            : { values: currentValues, errors: {} };

          if (result.errors && Object.keys(result.errors).length > 0) {
            setErrors(result.errors);
            return;
          }

          setErrors({});
          await onValid(result.values);
          setIsSubmitSuccessful(true);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [getValues, resolver]
  );

  const setValue = useCallback(
    (name: string, value: unknown) => {
      updateValue(name, value);
    },
    [updateValue]
  );

  const reset = useCallback(
    (nextValues?: Partial<TValues>) => {
      const base = clone(defaultRef.current);
      const merged = nextValues ? mergeDeep(base, nextValues) : base;
      defaultRef.current = clone(merged as TValues);
      setValues(clone(merged as TValues));
      setErrors({});
      setIsSubmitSuccessful(false);
    },
    []
  );

  const formState: FormState = useMemo(
    () => ({ errors, isSubmitting, isSubmitSuccessful }),
    [errors, isSubmitting, isSubmitSuccessful]
  );

  return {
    register,
    handleSubmit,
    formState,
    setValue,
    reset,
    getValues,
  };
}
