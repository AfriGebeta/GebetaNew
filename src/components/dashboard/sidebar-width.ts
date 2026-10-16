export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 400;
export const SIDEBAR_DEFAULT_WIDTH = 254;
export const SIDEBAR_WIDTH_VAR = "--dash-sidebar-width";
export const SIDEBAR_WIDTH_STORAGE_KEY = "dashboard-sidebar-width";

export function clampSidebarWidth(width: number) {
  return Math.round(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width)));
}
