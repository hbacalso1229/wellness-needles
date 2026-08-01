/**
 * Admin nav + /admin tooling — on for local `next dev` and builds from the `dev` branch;
 * off for `main` / production. Override with NEXT_PUBLIC_ADMIN_UI_ENABLED=true|false.
 */
export function isAdminUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADMIN_UI_ENABLED === 'true'
}
