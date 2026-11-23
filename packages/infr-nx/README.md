# Codegena NX Plugin

`@codegena/infr-nx` provides shared lint and packaging configuration,
TypeScript declarations, and local Docker Compose executors.

The shared lint setup includes ESLint's CSS rules for `.css` files and a
Stylelint configuration for CSS in MUI/Emotion templates. UI libraries run both
checks through their existing Nx `lint` target.

Use `npm exec -- nx show project @codegena/infr-nx --json` to inspect its
targets, then run `npm exec -- nx build @codegena/infr-nx`,
`npm exec -- nx lint @codegena/infr-nx`, or
`npm exec -- nx test @codegena/infr-nx`.

## Local Docker Compose

Place a `docker-compose.yml` beside the project's `project.json`. Add these
entries to `targets`.

```json
{
  "docker-compose-build": {
    "executor": "@codegena/infr-nx:docker-compose-build",
    "cache": false
  },
  "docker-compose-up": {
    "executor": "@codegena/infr-nx:docker-compose-up",
    "cache": false,
    "continuous": true,
    "dependsOn": ["docker-compose-build"]
  }
}
```

Run `npm exec -- nx run <project>:docker-compose-up` to start the stack.
Pass `--detached` to run it in the background. Both executors run Compose from
the project directory, where it can find the project's `.env`. Use
`composeFile` for a different filename, `services` to select services, or
`--dryRun` to preview the Compose operations. Add an Nx build dependency
when the Dockerfile copies prebuilt artifacts.
