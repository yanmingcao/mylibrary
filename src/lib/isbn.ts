/**
 * ISBN validation and conversion utilities.
 * Normalizes all ISBNs to ISBN-13 for consistent storage.
 */

/** Strip hyphens and spaces from ISBN string */
export function cleanIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

/** Validate ISBN-10 format and check digit */
export function isValidIsbn10(isbn: string): boolean {
  const clean = cleanIsbn(isbn);
  if (!/^\d{9}[\dXx]$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  const last = clean[9].toUpperCase();
  sum += last === "X" ? 10 : parseInt(last);

  return sum % 11 === 0;
}

/** Validate ISBN-13 format and check digit */
export function isValidIsbn13(isbn: string): boolean {
  const clean = cleanIsbn(isbn);
  if (!/^\d{13}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;

  return check === parseInt(clean[12]);
}

/** Convert ISBN-10 to ISBN-13 */
export function isbn10to13(isbn10: string): string {
  const clean = cleanIsbn(isbn10);
  const base = "978" + clean.slice(0, 9);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;

  return base + check;
}

/**
 * Normalize any ISBN input to ISBN-13.
 * Returns the ISBN-13 string, or null if invalid.
 */
export function normalizeIsbn(isbn: string): string | null {
  const clean = cleanIsbn(isbn);

  if (clean.length === 13 && isValidIsbn13(clean)) {
    return clean;
  }

  if ((clean.length === 10) && isValidIsbn10(clean)) {
    return isbn10to13(clean);
  }

  return null;
}
