# Codegena runners

Both runner images come from the [same Dockerfile](pull-request/Dockerfile).
The GitHub image adds the official Actions runner to the local act image.

## 🧪 Test workflows with act

From the repository root:

```bash
docker compose -f runners/docker-compose.yml build pull-request-act
```

Use the [gh-act guide](../.agents/skills/gh-act/SKILL.md) to start a fresh local
registry and run the workflow with `--bind=false --rm`. The repository's
[act configuration](../.actrc) selects the image built above.

To use Verdaccio on its own:

```bash
docker compose -p codegena-act-registry -f runners/docker-compose.yml \
  up --detach --wait verdaccio
```

The registry UI is at [localhost:4873](http://127.0.0.1:4873/).

## 🏃 Start the GitHub runner

If the Docker socket belongs to a group other than GID 0, set
`DOCKER_SOCKET_GID` to that group ID before starting or recreating the runner.

From the repository root, using the Docker context where the runner was registered:

```bash
docker compose -f runners/docker-compose.yml up -d pull-request-runner
```

On macOS, keep `caffeinate -i` running in a terminal while the runner accepts
jobs. Idle sleep interrupts the runner connection and artifact uploads.

After the locked Playwright version changes, rebuild both images and recreate
the GitHub runner so the Chromium system dependencies match.

The Compose volume keeps the registration across restarts. Check the runner in
[GitHub Settings → Actions → Runners](https://github.com/koshevy/codegena/settings/actions/runners).

To stop it:

```bash
docker compose -f runners/docker-compose.yml stop pull-request-runner
```

### Upgrade an existing runner from the root-based image

Run this once to keep the existing registration and make its volume writable
by the new runner user:

```bash
compose=(docker compose -f runners/docker-compose.yml)
"${compose[@]}" build pull-request-runner &&
  "${compose[@]}" stop pull-request-runner &&
  "${compose[@]}" run --rm --no-deps --user root pull-request-runner \
    chown -R runner:runner /opt/actions-runner &&
  "${compose[@]}" up -d pull-request-runner
```

### Register on a new Docker host

Use a dedicated Docker host for this public repository. Jobs have access to
that host's Docker socket. See [GitHub's runner security guidance](https://docs.github.com/en/actions/reference/security/secure-use#hardening-for-self-hosted-runners).

Build the image and authenticate `gh` with repository administration access.
A fine-grained token needs **Administration: write** for `koshevy/codegena`.
[GitHub registration token API](https://docs.github.com/en/rest/actions/self-hosted-runners#create-a-registration-token-for-a-repository)

```bash
docker compose -f runners/docker-compose.yml build pull-request-runner
gh api --method POST repos/koshevy/codegena/actions/runners/registration-token --jq .token \
  | docker compose -f runners/docker-compose.yml run --rm --no-deps -T \
      pull-request-runner bash -ec '
        IFS= read -r token
        exec ./config.sh --unattended --url "$RUNNER_REPOSITORY_URL" \
          --name "$RUNNER_NAME" --token "$token"
      '
```

Once registration succeeds, run the start command above.
