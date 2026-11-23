/**
 * Documented color intent for contributors.
 * Keep palette semantics aligned with these roles when adding new tokens.
 */
export const paletteMeta = {
  primary: 'Brand interaction — links, primary actions, selected navigation.',
  secondary:
    'Accent highlights — badges, active tab indicators, decorative emphasis.',
  info: 'Informational feedback only — badges, alerts, neutral system messages.',
  success: 'Positive outcomes — confirmations, online status, completed states.',
  warning: 'Cautionary feedback — pending actions, non-blocking alerts.',
  error: 'Destructive or failed states — validation errors, critical alerts.',
  focus: 'Keyboard and pointer focus rings — input borders, focused controls.',
  neutral:
    'Structural grayscale — text hierarchy, dividers, surfaces, placeholders.',
} as const;
