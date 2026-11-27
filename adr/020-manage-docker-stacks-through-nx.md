---
status: proposed
date: 2026-11-27
decision-makers: Codegena project maintainers
---

# Manage Docker stacks through Nx

## Why

An application image often needs artifacts from several Nx projects.
Declaring those dependencies in Nx lets local development, E2E, and CI use
the same build order and the same project-owned Compose configuration.

## Decision

> [!IMPORTANT]
> **Nx projects MUST use `@codegena/infr-docker-compose` as the base for
> Docker Compose build, up, and push targets.**

### 📦 Project ownership

- **One stack per project.** A Docker-based project **MUST** own its
  `docker-compose.yml`, `Dockerfile`, and environment files. Keep them beside
  its Nx configuration.
- **Several images in one stack.** Use named Dockerfile stages and separate
  Compose services when one project needs a proxy and an application runtime.
  Landing SSR builds Caddy and Bun images from one Dockerfile and starts them
  together. [Landing SSR Compose](../apps/landing-mf-host-ssr/docker-compose.yml)
- GitHub runner infrastructure has its own Compose file under `runners/`.
  It starts the tooling used to run Nx projects. [Runner guide](../runners/README.md)

### 🌱 Environment files

- **Visible defaults.** Put the local values in `.env.local`. Each
  `.env.<environment>` **MUST** provide the values its stack requires. Use
  those values as Compose build arguments or service environment variables
  so the same Dockerfile and Compose file serve each environment.
- **Private values.** Keep credentials and private endpoints in CI secrets
  or a private file outside the checkout. Use `IMAGE=${IMAGE}` in the
  committed profile and supply `IMAGE` in the runner environment.
- **Shared inputs.** Targets can set `rootEnvFilePath` when they need an
  environment file owned by another project. The executor prepares a resolved
  env file and Compose manifest for named environments.
  [Executor reference](../packages/infr-docker-compose/README.md)

Select an environment through a predefined Nx target configuration. Set
`defaultConfiguration` to the expected default and name remote configurations
explicitly in CI. For example, Landing SSR uses `docker-compose-build:local`
locally and `docker-compose-push:uat` in the release workflow.
[Landing SSR targets](../apps/landing-mf-host-ssr/project.json)

### 🔗 Tasks and the Nx graph

- **Build artifacts first.** Use `dependsOn` to run the application's build
  target before building its images. If a Dockerfile consumes an artifact
  across projects and Nx cannot infer the relationship, declare the project
  edge in `implicitDependencies` and the required task in `dependsOn`.
- **Start and publish through targets.** Use the plugin's `build`, `up`, and
  `push` executors. Use `dependsOn` for a prepared image or use the executor's
  `build: true` where a push needs to build for its selected environment.
  Set `continuous: true` for a long-running development stack.
- **Keep side effects visible.** Docker targets **MUST** disable Nx result
  caching. Docker may still reuse image layers. Use `nx show project` to
  inspect options and `nx graph` to inspect project dependencies before
  changing the order.

## Trade-offs

- Projects declare their environment values and task dependencies explicitly.
  An environment can change image tags or ports while using the same services.
- The prepared files can contain resolved private values. Handle them with the
  same care as the original secrets.

## Verification

- Check the resolved Nx configurations and the dependency graph.
- Build the selected environment through Nx. For example:

  ```
  npm exec -- nx run landing-mf-host-ssr:docker-compose-build:local
  ```

- Check that the resolved manifest names the expected images, passes the ports
  through to the services, and keeps the health checks active.
