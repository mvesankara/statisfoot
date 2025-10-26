const DEBUG_ENABLED = process.env.NODE_ENV !== "production";

export function debug(scope: string, message: string, context?: unknown) {
  if (!DEBUG_ENABLED) return;
  if (context !== undefined) {
    console.debug(`[${scope}] ${message}`, context);
  } else {
    console.debug(`[${scope}] ${message}`);
  }
}

export function debugError(scope: string, error: unknown, context?: unknown) {
  if (!DEBUG_ENABLED) return;
  if (context !== undefined) {
    console.error(`[${scope}]`, context, error);
  } else {
    console.error(`[${scope}]`, error);
  }
}
