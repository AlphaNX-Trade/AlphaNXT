/**
 * Single hardcoded admin account, as requested. Real access control lives
 * in Firestore security rules (request.auth.token.email == ADMIN_EMAIL) —
 * this constant on the client is only used to decide what UI to show, and
 * is NOT itself a security boundary (a user could edit client code, but
 * could never pass the Firestore rules check without actually being signed
 * in as this email).
 */
export const ADMIN_EMAIL = 'admin.alphanxt@gmail.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
