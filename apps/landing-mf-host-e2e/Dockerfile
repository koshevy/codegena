FROM node:24.22.3-alpine3.24@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS playwright
RUN apk upgrade --no-cache \
  && apk add --no-cache chromium-headless-shell font-liberation \
  && npm install --global --ignore-scripts --no-audit --no-fund npm@12.2.3
RUN apk add --no-cache mesa-vulkan-swrast

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/landing-mf-host-e2e/package.json ./apps/landing-mf-host-e2e/
COPY packages/infr-nx/package.json ./packages/infr-nx/
RUN npm ci --ignore-scripts --no-audit --no-fund \
    --workspace=landing-mf-host-e2e \
  && npm cache clean --force
COPY nx.json tsconfig.base.json ./
COPY --chown=node:node apps/landing-mf-host-e2e/ ./apps/landing-mf-host-e2e/
COPY --chown=node:node dist/apps/landing-mf-host/ ./dist/apps/landing-mf-host/
RUN cp dist/apps/landing-mf-host/index.html dist/apps/landing-mf-host/404.html \
  && chown node:node dist
USER node
WORKDIR /workspace/apps/landing-mf-host-e2e
CMD ["../../node_modules/.bin/playwright", "test", "--retries=0", "--update-snapshots=none"]

FROM chromedp/headless-shell:stable@sha256:381353d3530ab9d579d2fe8b9c0f4519c995617f5a71daf6bb649e2d12005bd9 AS chrome
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
