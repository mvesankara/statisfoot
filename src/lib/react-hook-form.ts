import { useCallback, useMemo, useRef, useState } from "react";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type MutableRecord = Record<string, unknown>;

export type FieldError = {
  message: string;
};

export type FieldErrors = Record<string, FieldError>;

export type ResolverResult<TValues> = {
  values: TValues;
  errors: FieldErrors;
};

export type Resolver<TValues extends MutableRecord> = (
  values: TValues
) => Promise<ResolverResult<TValues>> | ResolverResult<TValues>;

export interface UseFormOptions<TValues extends MutableRecord> {
  defaultValues?: TValues;
  resolver?: Resolver<TValues>;
}

export interface RegisteredField {
  name: string;
  value: unknown;
  onChange: (event: React.ChangeEvent<FieldElement>) => void;
  onBlur: () => void;
}

export interface FormState {
  errors: FieldErrors;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
}

export interface UseFormReturn<TValues extends MutableRecord> {
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

function setValueByPath(target: MutableRecord, path: string, value: unknown) {
  const segments = path.split(".");
  let current: MutableRecord = target;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
    } else {
      const next = current[segment];
      if (typeof next !== "object" || next === null || Array.isArray(next)) {
        current[segment] = {};
      }
      current = current[segment] as MutableRecord;
    }
  });
}

function getValueByPath(target: MutableRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof acc !== "object") return undefined;
    return (acc as MutableRecord)[segment];
  }, target);
}

function mergeDeep<T extends MutableRecord>(base: T, patch: Partial<T>): T {
  const result: MutableRecord = { ...base };
  Object.entries(patch || {}).forEach(([key, value]) => {
    const current = result[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = mergeDeep(
        current as MutableRecord,
        value as Partial<MutableRecord>
      );
    } else {
      result[key] = value as unknown;
    }
  });
  return result as T;
}

export function useForm<TValues extends MutableRecord = MutableRecord>(
  options: UseFormOptions<TValues> = {}
): UseFormReturn<TValues> {
  const { defaultValues, resolver } = options;
  const initialDefaults = clone((defaultValues ?? {}) as TValues);
  const defaultRef = useRef<TValues>(initialDefaults);
  const [values, setValues] = useState<TValues>(clone(initialDefaults));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const getValues = useCallback(() => clone(values), [values]);

  const updateValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => {
      const next = clone(prev);
      setValueByPath(next as MutableRecord, name, value);
      return next;
    });
  }, []);

  const register = useCallback(
    (name: string): RegisteredField => {
      return {
        name,
        value: getValueByPath(values as MutableRecord, name) ?? "",
        onChange: (event: React.ChangeEvent<FieldElement>) => {
          const target = event.target;
          let nextValue: unknown = target.value;

          if (target instanceof HTMLInputElement) {
            if (target.type === "checkbox") {
              nextValue = target.checked;
            } else if (target.type === "file") {
              nextValue = target.files;
            } else {
              nextValue = target.value;
            }
          }

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
      const merged = nextValues ? mergeDeep(base, nextValues as Partial<TValues>) : base;
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
