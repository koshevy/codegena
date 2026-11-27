ARG CADDY_VERSION
ARG BUN_VERSION

FROM caddy:${CADDY_VERSION:+${CADDY_VERSION}-}builder-alpine AS caddy-builder
# Apply the upstream dependency fixes ahead of the next Caddy release.
RUN XCADDY_SETCAP=0 xcaddy build \
  --output /usr/bin/caddy \
  --replace github.com/smallstep/certificates=github.com/smallstep/certificates@v0.30.3-0.20261105213751-6d5a251fbe01 \
  --replace go.opentelemetry.io/otel/sdk/log=go.opentelemetry.io/otel/sdk/log@v1.47.0 \
  --replace golang.org/x/crypto=golang.org/x/crypto@v0.59.0

FROM caddy:${CADDY_VERSION:+${CADDY_VERSION}-}alpine AS caddy
COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
COPY apps/landing-mf-host-ssr/Caddyfile /etc/caddy/Caddyfile
RUN apk upgrade --no-cache \
  && addgroup -g 10001 caddy \
  && adduser -D -H -u 10001 -G caddy caddy \
  && chown -R caddy:caddy /config /data
USER caddy
HEALTHCHECK --interval=2s --timeout=3s --retries=10 \
  CMD wget -q --no-check-certificate --spider "https://localhost:${CADDY_HTTPS_PORT}/manifest.webmanifest"

FROM oven/bun:${BUN_VERSION:+${BUN_VERSION}-}alpine AS ssr
RUN apk upgrade --no-cache
WORKDIR /app
COPY dist/apps/landing-mf-host/ ./landing-mf-host/
COPY dist/apps/landing-mf-host-renderer/renderer.cjs ./landing-mf-host-renderer/renderer.cjs
COPY dist/apps/landing-mf-host-ssr/main.js ./landing-mf-host-ssr/main.js
USER bun
HEALTHCHECK --interval=2s --timeout=3s --retries=10 \
  CMD ["bun", "-e", "process.exit((await fetch(`http://127.0.0.1:${process.env.PORT}/manifest.webmanifest`)).ok ? 0 : 1)"]
CMD ["bun", "landing-mf-host-ssr/main.js"]
