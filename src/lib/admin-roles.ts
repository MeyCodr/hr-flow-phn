import { Role } from "@/generated/enums";

// Pure role predicates, safe to import from client components. The server-side
// guards that use them live in admin-access.ts, which pulls in prisma and
// next-auth and must never reach the browser bundle.

// Roles allowed to reach the Admin dashboard and the endpoints behind it.
export const ADMIN_ROLES: Role[] = [
  Role.ADMIN,
  Role.FORM_ADMIN,
];

// Admins whose reach is limited to the form types assigned to them. Everyone
// else in ADMIN_ROLES administers the whole system.
export const SCOPED_ADMIN_ROLES: Role[] = [Role.FORM_ADMIN];

// The only role that may reconfigure the system: form types, approval flows,
// and other people's accounts. Everything else in ADMIN_ROLES is read-only.
export function isFullAdminRole(role: string | null | undefined): boolean {
  return role === Role.ADMIN;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as string[]).includes(role);
}

export function isScopedAdminRole(role: string | null | undefined): boolean {
  return !!role && (SCOPED_ADMIN_ROLES as string[]).includes(role);
}
