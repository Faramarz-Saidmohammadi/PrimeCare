const FORMULA_PREFIX = /^\s*[=+\-@]/;

/**
 * Serializes a value as one CSV cell and prevents spreadsheet applications
 * from interpreting user-controlled text as a formula.
 */
export function escapeCsvCell(input: unknown) {
  const value = String(input ?? "");
  const safeValue = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}
