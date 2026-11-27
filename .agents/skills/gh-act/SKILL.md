---
name: gh-act
description: Run and debug GitHub Actions workflows locally with the GitHub CLI and act. Use when asked to test a workflow, reproduce a CI job locally, or set up gh act.
---

# Test GitHub Actions locally

## Check the tools

From the repository you intend to test, check these in order:

```sh
command -v gh
gh --version
gh act --version
docker info --format '{{.ServerVersion}}'
```

- If `gh` is missing, use the platform instructions on the
  [GitHub CLI site](https://cli.github.com/).
- If `gh` is available and the `act` extension is missing, install it when
  setting up the local tools. [act installation guide](https://nektosact.com/installation/gh.html)

  ```sh
  gh extension install nektos/gh-act
  ```

- If Docker cannot connect, start the local Docker engine or fix its
  connection before running a job.

## Select and run the workflow

Always run local workflows with `--bind=false --rm`. The first flag copies the
checkout into Docker so commits and tags stay there. The second cleans up job
containers and volumes after failed runs.

Read `.github/workflows/` in the checkout you are testing. Check the event,
job ID, and `runs-on` label. This checkout's `.actrc` maps `self-hosted` and `ubuntu-24.04` to
`codegena-pull-request-act:local`. Build it before the first run and after
changes to the [shared Dockerfile](../../../runners/pull-request/Dockerfile).

```sh
docker compose -f runners/docker-compose.yml build pull-request-act
```

### Start a fresh registry for every run

Use this Bash function from the repository root for every `gh act` invocation.
Each call removes the previous act registry and its storage before starting a
fresh registry and creating a new test token. Run one check at a time. Keep
Verdaccio running after the check so the staged packages remain available in
the browser. The web interface is bound to localhost.

```bash
run_act() (
  set -euo pipefail
  registry_project=codegena-act-registry
  registry=(docker compose -p "$registry_project" -f runners/docker-compose.yml)
  "${registry[@]}" rm --stop --force --volumes verdaccio
  "${registry[@]}" up --detach --wait verdaccio

  NPM_REGISTRY=http://verdaccio:4873/
  VERDACCIO_PASSWORD="$(node -p "require('node:crypto').randomUUID()")"
  export VERDACCIO_PASSWORD
  NPM_TOKEN=$("${registry[@]}" exec -T -e VERDACCIO_PASSWORD verdaccio node --input-type=module <<'JS'
const name = 'act-stager';
const response = await fetch(`http://127.0.0.1:4873/-/user/org.couchdb.user:${name}`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name, password: process.env.VERDACCIO_PASSWORD }),
});
const { token } = await response.json();
if (!response.ok || !token) throw new Error(`Verdaccio login failed (${response.status}).`);
process.stdout.write(token);
JS
  )
  export NPM_REGISTRY NPM_TOKEN

  act_status=0
  gh act "$@" --bind=false --rm --network "${registry_project}_default" \
    --secret-file "${CODEGENA_ACT_SECRETS_FILE:-/dev/null}" \
    --secret NPM_REGISTRY --secret NPM_TOKEN || act_status=$?

  printf '\nVerdaccio staged packages\n'
  report_status=0
  "${registry[@]}" exec -T -e NPM_TOKEN verdaccio sh -ec '
    npmrc=$(mktemp)
    trap "rm -f \"$npmrc\"" EXIT
    printf "%s\n" "//127.0.0.1:4873/:_authToken=\${NPM_TOKEN}" > "$npmrc"
    npm stage list --json --registry http://127.0.0.1:4873/ --userconfig "$npmrc"
  ' || report_status=$?

  printf '\nVerdaccio UI: http://127.0.0.1:4873/\n'
  printf 'Username: act-stager\nPassword: %s\n' "$VERDACCIO_PASSWORD"
  printf 'After signing in, choose Staged packages from the account menu.\n'

  if (( act_status != 0 )); then return "$act_status"; fi
  return "$report_status"
)
```

Pass the event and any job filters to the function:

```bash
run_act pull_request
run_act push -W .github/workflows/release-alpha.yml \
  --artifact-server-path "$(mktemp -d)" \
  --artifact-server-addr "$(ipconfig getifaddr en0)"
```

The release workflow requires an artifact server to transfer files between jobs.
Use a directory outside the build output and an address the runner containers can reach.

For an intentional UAT deployment, keep the matching GitHub Actions secrets
in `~/.config/codegena/.env.uat.secrets`, including the full script as
`DEPLOY_SNIPPET_LANDING`. Use `--secret-file` so the script is passed as
a multiline secret. Keep the directory at mode `0700` and the file at `0600`.
Pass the file only to the alpha release workflow.

```bash
CODEGENA_ACT_SECRETS_FILE="$HOME/.config/codegena/.env.uat.secrets" \
  run_act push -W .github/workflows/release-alpha.yml --env UAT_DEPLOY=true \
    --artifact-server-path "$(mktemp -d)" \
    --artifact-server-addr "$(ipconfig getifaddr en0)"
```

When rehearsing the alpha release from another branch, pass a push event
fixture with `-e <file>`. Set `ref` to `refs/heads/master` and `after` to the
commit you are testing.

Use `--list` to find a job or `--dryrun` to inspect the plan. Run the actual
push job to verify that Verdaccio stores the staged tarballs. For publishing
checks, include the staged package listing even when the workflow fails.
An empty list after a run with no version bumps is expected. To exercise
publishing, use a disposable checkout with an unreleased conventional commit
that touches a publishable package.

If a step reads PR fields such as `github.base_ref`, pass a local event
fixture with `-e <file>`. Review publishing and deployment jobs before running
them. Keep production registry credentials out of local runs.
[act usage guide](https://nektosact.com/usage/)

## Report the result

For every run that starts Verdaccio, show the **live UI link**, username, and
**temporary web password** together in the user-facing report. This applies to
job failures, `--list`, and `--dryrun` too. Copy the password printed by that
run because the next reset generates a new one.

Report the event, workflow or job ID, and result. Say whether you listed
jobs, checked the plan, or executed the steps. If a run fails, identify
the first failing step and whether it failed in the workflow, local runner
image, or Docker setup. For an architecture error on Apple Silicon, check
the image architecture before using `--container-architecture linux/amd64`.
[act runner images](https://nektosact.com/usage/runners.html)
