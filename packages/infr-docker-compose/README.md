# Docker Compose Nx Plugin

Keep the `Dockerfile` and `docker-compose.yml` beside the owning project's
`project.json`. Add these entries to `targets`. The repository policy is in
[ADR 020](../../adr/020-manage-docker-stacks-through-nx.md).

```json
{
  "docker-compose-build": {
    "executor": "@codegena/infr-docker-compose:build",
    "cache": false
  },
  "docker-compose-up": {
    "executor": "@codegena/infr-docker-compose:up",
    "cache": false,
    "continuous": true,
    "dependsOn": ["docker-compose-build"]
  }
}
```

Run `npm exec -- nx run <project>:docker-compose-up` to start the stack.
Pass `--detached` to run it in the background. Set `environment` in named
Nx configurations, such as `uat` for each selected project's `.env.uat` file. The build executor writes the combined
env file and resolved Compose manifest to `outputPath`, which defaults to
`dist/docker-compose`. The up and push executors reuse those files. Pass `--build`
with either executor to prepare and build before running it.

By default the executor runs the owning project's Compose file. Set `projects`
to combine multiple projects. For a combined stack, define relative paths
from the workspace root. Set `rootEnvFilePath` to load a shared file. With a
named environment, it is combined with the selected project profiles. On a
target without an environment, Compose reads the shared file directly.
Use `services` to select services and `--dryRun` to preview operations.
Set `exitCodeFrom` for a test service whose exit code Nx should report.

## Inject environment variables

Use `IMAGE=${IMAGE}` in a profile to read `IMAGE` from the process environment.
Use a single level of placeholders with the syntax and defaults from
[env-interpolation](https://github.com/magarcia/env-interpolation#placeholder-syntax).
The prepared env file contains the resolved values, so it can be used with the
generated Compose manifest on another machine.
