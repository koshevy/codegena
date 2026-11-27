# `@codegena/notification-ui-notistack`

Local UI notification transport for `@codegena/notification-ui-core`, implemented with Notistack. `NotistackNotificationProvider` renders Codegena-themed messages, stacks visible notifications, and groups overflow into an expandable summary.

Mount it inside an MUI `ThemeProvider`, then call the shared `useNotification()` facade from descendants. The provider accepts `maxVisible` to set the stack capacity (default 4).
