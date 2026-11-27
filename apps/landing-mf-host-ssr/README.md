# Landing SSR

With Docker and the Compose plugin running, start the landing stack from the
workspace root.

```sh
npm exec -- nx run landing-mf-host-ssr:docker-compose-up
```

The Docker build and up targets select the `local` configuration by default. Compare
the [local defaults](.env.local) with the [UAT profile](.env.uat) when
setting up another environment. Both profiles list the image versions and
network settings used by Compose.

Caddy serves [https://localhost](https://localhost) via port 443 on loopback.
TCP serves HTTPS and UDP serves HTTP/3. Nx builds the SSR server, renderer,
and browser assets before Compose packages them into the Bun image.

- Run `npm exec -- nx run landing-mf-host-ssr:docker-compose-build` to build
  the image without starting containers.
- Pass `--detached` to leave the stack running in the background. Stop it with
  `docker compose --env-file apps/landing-mf-host-ssr/.env.local -f apps/landing-mf-host-ssr/docker-compose.yml down`.

## Deploy to UAT

The [alpha workflow](../../.github/workflows/release-alpha.yml) runs on pushes
to `master` and temporarily accepts `codegena-4.x` for a UAT rehearsal.
The rehearsal runs UAT deployment and leaves npm staging to `master`.
The workflow updates the two private UAT image tags and pulls them over SSH
as `codegena-deploy`. The VM runs rootless Docker Compose and keeps its Caddy
certificates across deployments. The executor resolves the references in the
[UAT profile](.env.uat) using values GitHub Actions supplies. Local development
uses the [local profile](.env.local).

Add these GitHub Actions secrets before running the workflow.

| Secret | Value |
| --- | --- |
| `NPM_REGISTRY` | npm registry URL for staged alpha packages |
| `NPM_TOKEN` | Token permitted to stage those packages |
| `UAT_HOSTNAME` | Public UAT hostname |
| `UAT_IP_ADDRESS` | Public UAT IP address |
| `UAT_SSR_IMAGE` | Fully qualified SSR image reference with the UAT tag |
| `UAT_CADDY_IMAGE` | Fully qualified Caddy image reference with the UAT tag |
| `UAT_REGISTRY_USERNAME` | Username with push access to the registry for both images |
| `UAT_REGISTRY_TOKEN` | Token with push access to that registry |
| `UAT_REGISTRY_PULL_CONFIG` | Docker `config.json` with read-only access |
| `DEPLOY_SNIPPET_LANDING` | Full Bash deployment script, including its line breaks |
| `UAT_SSH_HOST` | SSH hostname or IP address for the deployment VM |
| `UAT_SSH_PRIVATE_KEY` | Dedicated Ed25519 private key for `codegena-deploy` |
| `UAT_SSH_KNOWN_HOSTS` | Verified SSH host key for `UAT_SSH_HOST`, in `known_hosts` format |

To rotate the deployment key, generate a dedicated pair with
`ssh-keygen -t ed25519 -N '' -f ~/.ssh/codegena-uat-deploy`. Install the
`.pub` key in the deploy account's `authorized_keys` with the `restrict`
option and replace the private-key secret. Verify a changed server key
through the VM console before replacing the known-hosts secret.

The workflow reads the deployment script from `DEPLOY_SNIPPET_LANDING`.
Use the private copy at `~/.config/codegena/deploy-snippet-landing.sh` to
set that GitHub secret.

For an intentional UAT deployment through act, keep the matching secrets in
`~/.config/codegena/.env.uat.secrets` and follow the
[act guide](../../.agents/skills/gh-act/SKILL.md).

Caddy obtains a short-lived Let's Encrypt certificate for the UAT IP address.
The hostname uses its own public certificate once its DNS points to the VM.
After deployment, check `/manifest.webmanifest` over HTTPS on both addresses.
Allow TCP and UDP 443 through the VM's firewall for HTTPS and HTTP/3.
Rootless Docker needs permission to publish port 443.
[Docker's rootless port setup](https://docs.docker.com/engine/security/rootless/tips/#exposing-privileged-ports)

## Local certificate

After the first start, export Caddy's local root certificate.

```sh
docker compose --env-file apps/landing-mf-host-ssr/.env.local -f apps/landing-mf-host-ssr/docker-compose.yml cp \
  caddy:/data/caddy/pki/authorities/local/root.crt ./landing-caddy-root.crt
curl --cacert ./landing-caddy-root.crt https://localhost/
```

To open the site in a browser, import the exported certificate into the
browser's trust store or the system trust store it uses.
The `caddy-data` volume keeps the certificate authority across restarts.

## Cache headers

Caddy compresses eligible responses with Zstandard or gzip. Successfully served
static files with a content hash get a one-year immutable cache lifetime.
HTML and `service-worker.js` require revalidation. Stable URLs for remote
entries, manifests, and other unhashed files keep the upstream cache policy.
The build-specific HTML for a warm reload retains `no-store`.

## Security

Caddy sets HSTS, MIME sniffing protection, and a referrer policy. Browsers that
honor HSTS on localhost may upgrade other HTTP ports on that hostname.

The HTML policy blocks framing and restricts script downloads to the same
origin. It allows Zod and TypeGPU to compile code, inline styles for Emotion
and Monaco, and embedded font data for documentation.
[OWASP HTTP security headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)

Both services run as non-root users with read-only root filesystems. Caddy
stores certificates in the writable data volume.

The image rebuilds Caddy 2.11.9 with the upstream Smallstep update that
removes Go JOSE v3 and selects `golang.org/x/net` v0.62.0.
[Caddy dependency fixes](https://github.com/caddyserver/caddy/pull/8368)

The build also uses OpenTelemetry Logs SDK v1.47.0 for CVE-2026-128085
and `golang.org/x/crypto` v0.59.0, which moves OpenPGP out of the
module affected by GO-2026-5932. The builder stage is temporary until a
stable Caddy release includes these fixes.
[OpenTelemetry advisory](https://github.com/open-telemetry/opentelemetry-go/security/advisories/GHSA-q7gw-24fr-5p69)
· [Go advisory](https://pkg.go.dev/vuln/GO-2026-5932)

To refresh the base images and Alpine packages, run this command after
building the SSR artifacts.

```sh
docker compose --env-file apps/landing-mf-host-ssr/.env.local -f apps/landing-mf-host-ssr/docker-compose.yml build --pull --no-cache
```
