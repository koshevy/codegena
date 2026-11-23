/**
 * Classifies transport by type basing on behavior differences:
 * - `'ui'` — notifications in the same web view with web app
 * - `'agent'` — native notifications of execution environment (VSC notifications, pushes)
 * - `'backend'` — remote services communicating via API
 */
export type NotificationTransportType = (
  | 'ui'
  | 'agent'
  | 'backend'
);
