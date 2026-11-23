# Execution mode

Use `@codegena/util-dev-mode` to read development and testing flags in React.
Application startup supplies `DevModeEnvContext`; consumers use `useContext`.

```tsx
import { type DevModeEnv, DevModeEnvContext } from '@codegena/util-dev-mode';

const devModeEnv: DevModeEnv = {
  isDevMode: false,
  isTestingMode: false,
};

<DevModeEnvContext.Provider value={devModeEnv}>
  <App />
</DevModeEnvContext.Provider>;
```

The default is `{ isDevMode: true, isTestingMode: false }`. Production startup
must override it. Tests explicitly enable `isTestingMode` when they need
repeatable decorative visuals; ordinary browser tests can keep animations on.
Federated views inherit their host's flags through the shared singleton context.

See the [execution-mode ADR](../../adr/018-share-execution-mode-through-context.md).
