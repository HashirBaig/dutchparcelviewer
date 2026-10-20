export const isAbortError = (e: unknown): boolean =>
  typeof e === "object" &&
  e !== null &&
  (e as { name?: string }).name === "AbortError";

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);
