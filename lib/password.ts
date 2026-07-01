/* Client-side password strength floor. Supabase enforces the project's own
   policy server-side (set it in Auth → Policies); this is the UX check and a
   sensible minimum. Returns an error message, or null if acceptable. */
export const PASSWORD_MIN = 10;

export const PASSWORD_HINT = `At least ${PASSWORD_MIN} characters, including a letter and a number.`;

export function passwordError(pw: string): string | null {
  if (pw.length < PASSWORD_MIN)
    return `Use at least ${PASSWORD_MIN} characters.`;
  if (!/[a-zA-Z]/.test(pw)) return "Include at least one letter.";
  if (!/[0-9]/.test(pw)) return "Include at least one number.";
  return null;
}
