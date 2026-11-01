import { assertLocalDatabase } from "../scripts/local-database.mjs";

export function isLocalClientDirectoryEnabled(
  environment: NodeJS.ProcessEnv = process.env,
) {
  if (environment.NODE_ENV !== "development") return false;

  try {
    assertLocalDatabase(environment.DATABASE_URL);
    return true;
  } catch {
    return false;
  }
}

export function normalizeClientPhone(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function normalizePhoneSearch(value: string) {
  return value.replace(/\D/g, "");
}
