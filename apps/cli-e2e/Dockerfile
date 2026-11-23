ARG VERDACCIO_IMAGE=verdaccio/verdaccio
ARG NODE_IMAGE=node

FROM ${VERDACCIO_IMAGE} AS registry

USER root
RUN apk upgrade --no-cache
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER 10001

FROM ${NODE_IMAGE} AS workspace

ARG NPM_VERSION

RUN apk upgrade --no-cache \
  && npm install --global --ignore-scripts --no-audit --no-fund "npm@$NPM_VERSION" \
  && npm cache clean --force

COPY dist/oas3-core/ /opt/packages/oas3-core/
COPY dist/oas3-visitor-typescript/ /opt/packages/oas3-visitor-typescript/
COPY dist/playground-ui/ /opt/packages/playground-ui/
COPY dist/graph-core/ /opt/packages/graph-core/
COPY dist/graph-search-core/ /opt/packages/graph-search-core/
COPY dist/graph-search-ui/ /opt/packages/graph-search-ui/
COPY dist/graph-ui/ /opt/packages/graph-ui/
COPY dist/notification-ui-core/ /opt/packages/notification-ui-core/
COPY dist/pwa/ /opt/packages/pwa/
COPY dist/ui-theme/ /opt/packages/ui-theme/
COPY dist/ui-unified/ /opt/packages/ui-unified/

WORKDIR /opt/e2e
COPY apps/cli-e2e/docker-files/.npmrc /home/node/.npmrc
COPY apps/cli-e2e/docker-files/consumers/ ./templates/
COPY dist/apps/playground-mf-remote/specifications/pet-store.json ./specifications/
COPY dist/apps/playground-mf-remote/specifications/one-password.json ./specifications/
COPY dist/apps/playground-mf-remote/specifications/github.json ./specifications/

USER node
RUN <<'SH'
set -eu
for template in templates/*/*/; do
  specification="$(basename "$template")"
  import_form="$(basename "$(dirname "$template")")"
  consumer="/tmp/consumers/$specification/$import_form"
  mkdir -p "$consumer"
  ln -s ../generated "$consumer/generated"
  for fixture in "${template}"*.ts.template; do
    cp "$fixture" "$consumer/$(basename "${fixture%.template}")"
  done
  cp templates/tsconfig.json.template "$consumer/tsconfig.json"
  cp templates/tsconfig.invalid.json.template "$consumer/tsconfig.invalid.json"
done
SH

CMD for package in /opt/packages/*; do \
    npm publish "$package" --tag e2e --ignore-scripts --loglevel=warn || exit 1; \
  done \
  && touch "$INIT_COMPLETE_FILE" \
  && exec tail -f /dev/null

FROM ubuntu:22.04 AS workspace-windows

ARG WIN_NODE_VERSION
ARG WINE_NODE_DIST_DIR

ENV WINEDEBUG=-all \
    WINEDLLOVERRIDES="mscoree,mshtml=" \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSLo /etc/apt/keyrings/winehq-archive.key \
    https://dl.winehq.org/wine-builds/winehq.key \
  && curl -fsSLo /etc/apt/sources.list.d/winehq-jammy.sources \
    https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources \
  && dpkg --add-architecture i386 \
  && apt-get update \
  && apt-get install -y --no-install-recommends winehq-stable \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
RUN node_archive="node-v${WIN_NODE_VERSION}-win-x64.zip" \
  && node_release="https://nodejs.org/dist/v${WIN_NODE_VERSION}" \
  && curl -fsSLO "$node_release/$node_archive" \
  && curl -fsSLO "$node_release/SHASUMS256.txt" \
  && grep -F "  $node_archive" SHASUMS256.txt | sha256sum -c - \
  && unzip -q "$node_archive" \
  && mv "${node_archive%.zip}" "$WINE_NODE_DIST_DIR" \
  && rm "$node_archive" SHASUMS256.txt

WORKDIR /opt/e2e
COPY dist/apps/playground-mf-remote/specifications/one-password.json ./
COPY apps/cli-e2e/docker-files/consumers/05-root-named/one-password/valid.ts.template ./valid.ts
COPY apps/cli-e2e/docker-files/consumers/tsconfig.json.template ./tsconfig.json
COPY --chmod=0755 apps/cli-e2e/docker-files/windows-bin/node.template /usr/local/bin/node
COPY --chmod=0755 apps/cli-e2e/docker-files/windows-bin/npx.template /usr/local/bin/npx
COPY --chmod=0755 apps/cli-e2e/docker-files/windows-entrypoint.sh.template /entrypoint.sh

ENV WINEARCH=wow64 \
    XDG_RUNTIME_DIR=/tmp/wine-runtime \
    NPM_CONFIG_PROGRESS=false

RUN install -d -m 0700 "$XDG_RUNTIME_DIR" \
  && export WINEPREFIX=/opt/wineprefix_template \
  && wineboot --init \
  && wine reg add 'HKCU\Software\Wine\Drivers' /v Graphics /t REG_SZ /d null /f \
  && winecfg -v win10 \
  && wineserver -w

ENTRYPOINT ["/entrypoint.sh"]
