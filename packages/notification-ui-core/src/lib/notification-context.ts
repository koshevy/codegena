import { createContext } from 'react';

import type { NotificationTransport } from './notification-transport';

export const NotificationContext = createContext<NotificationTransport[] | null>(null);
