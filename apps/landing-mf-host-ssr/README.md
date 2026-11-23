# Landing SSR

With Docker and the Compose plugin running, start the landing stack from the
workspace root.

```sh
npm exec -- nx run landing-mf-host-ssr:docker-compose-up
```

Caddy serves [https://localhost](https://localhost) via port 443 on loopback.
TCP serves HTTPS and UDP serves HTTP/3. Nx builds the SSR server, renderer,
and browser assets before Compose packages them into the Bun image.

- Run `npm exec -- nx run landing-mf-host-ssr:docker-compose-build` to build
  the image without starting containers.
- Pass `--detached` to leave the stack running in the background. Stop it with
  `docker compose -f apps/landing-mf-host-ssr/docker-compose.yml down`.

## Local certificate

After the first start, export Caddy's local root certificate.

```sh
docker compose -f apps/landing-mf-host-ssr/docker-compose.yml cp \
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
docker compose -f apps/landing-mf-host-ssr/docker-compose.yml build --pull --no-cache
```
