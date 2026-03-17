// ─── RBAC desde backend ───────────────────────────────────────────────────────
//
// Los permisos reales vienen en la respuesta del login/refresh.
// Este archivo solo define los tipos que usa el frontend para tipado estático.
// NO hay mapa estático de roles → permisos: esa lógica vive en el backend.

/**
 * Tipo del rol — se usa solo para mostrar etiquetas en la UI (avatar, badge).
 * El backend puede devolver cualquier string; amplia este tipo si quieres
 * autocompletado, o usa `string` directamente para máxima flexibilidad.
 */
export type Role = string;

/**
 * Permisos conocidos por el frontend.
 * Se usan como literales en AuthorizedRoute y en el menú.
 * Si el backend agrega permisos nuevos, añádelos aquí para mantener el tipado.
 */
export type Permission =
  | "dashboard:view"
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "reports:view"
  | "reports:export"
  | "settings:view"
  | "settings:edit"
  | "audit:view"
  | (string & {}); // permite permisos dinámicos sin perder autocompletado
