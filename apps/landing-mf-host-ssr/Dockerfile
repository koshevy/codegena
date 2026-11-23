ARG CADDY_VERSION=2.11.9

FROM caddy:${CADDY_VERSION}-builder-alpine AS caddy-builder
# Apply the upstream dependency fixes ahead of the next Caddy release.
RUN XCADDY_SETCAP=0 xcaddy build \
  --output /usr/bin/caddy \
  --replace github.com/smallstep/certificates=github.com/smallstep/certificates@v0.30.3-0.20261105213751-6d5a251fbe01 \
  --replace go.opentelemetry.io/otel/sdk/log=go.opentelemetry.io/otel/sdk/log@v1.47.0 \
  --replace golang.org/x/crypto=golang.org/x/crypto@v0.59.0

FROM caddy:${CADDY_VERSION}-alpine AS caddy
COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
RUN apk upgrade --no-cache \
  && addgroup -g 10001 caddy \
  && adduser -D -H -u 10001 -G caddy caddy \
  && chown -R caddy:caddy /config /data
USER caddy

FROM oven/bun:1-alpine AS ssr
RUN apk upgrade --no-cache
WORKDIR /app
COPY dist/apps/landing-mf-host/ ./landing-mf-host/
COPY dist/apps/landing-mf-host-renderer/renderer.cjs ./landing-mf-host-renderer/renderer.cjs
COPY dist/apps/landing-mf-host-ssr/main.js ./landing-mf-host-ssr/main.js
USER bun
CMD ["bun", "landing-mf-host-ssr/main.js"]
