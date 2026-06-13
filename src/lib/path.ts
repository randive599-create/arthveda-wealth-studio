/**
 * Current-route helpers shared by the router (App) and the navigation
 * components. There is no client-side router — each route is a full page load —
 * so the active path is simply the current pathname, normalized by stripping a
 * trailing slash (except for the root "/").
 */

export function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

/** Whether `itemPath` is the active route given the current `path`. */
export function isActivePath(path: string, itemPath: string): boolean {
  const normalized = path.replace(/\/+$/, '') || '/';
  return normalized === itemPath;
}
