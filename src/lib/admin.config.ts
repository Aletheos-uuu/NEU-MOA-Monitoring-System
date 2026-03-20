/**
 * admin.config.ts
 *
 * List email addresses that should automatically receive the 'admin' role
 * on their very first login — no manual Firestore update needed.
 *
 * Rules:
 *  - Must be @neu.edu.ph addresses (others are blocked at the auth gate anyway)
 *  - Changes here only affect NEW users (first-time logins)
 *  - To change an existing user's role, use the /admin/users panel instead
 */

export const ADMIN_EMAILS: string[] = [
  'jcesperanza@neu.edu.ph',
  'aletheosmikael.penarubia@neu.edu.ph',
];