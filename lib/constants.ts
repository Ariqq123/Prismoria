export const PANEL_URLS = [
  "https://panel.xentranetwork.de",
  "https://panel.kingsdom.uk",
  "https://panel.spaceify.eu"
] as const;

export const PANEL_MAP = {
  xentranetwork: "https://panel.xentranetwork.de",
  kingsdom: "https://panel.kingsdom.uk",
  spaceify: "https://panel.spaceify.eu"
} as const;

export type PanelSlug = keyof typeof PANEL_MAP;
