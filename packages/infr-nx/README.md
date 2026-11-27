# Codegena NX Plugin

`@codegena/infr-nx` provides shared lint and packaging configuration
and TypeScript declarations.

The shared lint setup includes ESLint's CSS rules for `.css` files and a
Stylelint configuration for CSS in MUI/Emotion templates. UI libraries run both
checks through their existing Nx `lint` target.

Use `npm exec -- nx show project @codegena/infr-nx --json` to inspect its
targets, then run `npm exec -- nx build @codegena/infr-nx`,
`npm exec -- nx lint @codegena/infr-nx`, or
`npm exec -- nx test @codegena/infr-nx`.
