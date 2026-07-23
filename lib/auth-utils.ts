/** Normalize Indian phone to E.164 (+91XXXXXXXXXX) */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

/** Phone digits only (10-digit local part), e.g. "9500943141" */
export function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  return digits.slice(-10);
}

/**
 * Deterministic internal auth email for phone accounts.
 * Lets customers sign in with phone + password fully client-side,
 * with no SMS and no Google — 100% free.
 */
export function phoneToAuthEmail(phone: string): string {
  return `${phoneDigits(phone)}@phone.srboutique.app`;
}

export function isPhoneAuthEmail(email: string | undefined | null): boolean {
  return Boolean(email && email.endsWith("@phone.srboutique.app"));
}

/** Username from email address (part before @) */
export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] || "user";
  return local.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 30) || "user";
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 30) return "Username must be under 30 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscore";
  }
  return null;
}
