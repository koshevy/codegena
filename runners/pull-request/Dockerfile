ARG NODE_VERSION=24.22.3
ARG NPM_VERSION=12.2.3
ARG CODEQL_VERSION=2.27.5
FROM node:${NODE_VERSION}-slim AS node-toolchain
ARG NPM_VERSION
RUN npm install --global "npm@${NPM_VERSION}" --no-audit --no-fund
FROM ubuntu:26.04 AS pull-request-act
ARG CODEQL_VERSION
ARG TARGETARCH
ENV PATH="/opt/codeql:${PATH}"
COPY --from=node-toolchain /usr/local/lib /usr/local/lib
COPY --from=node-toolchain /usr/local/include /usr/local/include
COPY --from=node-toolchain /usr/local/bin /usr/local/bin
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    awscli \
    ca-certificates \
    curl \
    docker-buildx \
    docker-compose-v2 \
    docker.io \
    git \
    gnupg \
    jq \
    lsb-release \
    openjdk-11-jdk-headless \
    openssh-client \
    pipx \
    python3 \
    python3-pip \
    tar \
    xz-utils \
    zstd \
  && rm -rf /var/lib/apt/lists/*
RUN case "$TARGETARCH" in \
    amd64) platform=linux64 ;; \
    arm64) platform=linux-arm64 ;; \
    *) echo "Unsupported CodeQL architecture: $TARGETARCH" >&2; exit 1 ;; \
  esac \
  && curl -fsSL "https://github.com/github/codeql-action/releases/download/codeql-bundle-v${CODEQL_VERSION}/codeql-bundle-${platform}.tar.zst" \
    | tar --zstd -xf - -C /opt
ENV PIPX_HOME=/opt/pipx PIPX_BIN_DIR=/usr/local/bin
RUN pipx install sarif-tools \
  && pipx install semgrep

RUN --mount=type=bind,source=package-lock.json,target=/tmp/package-lock.json \
  playwright_version="$(node -p 'require("/tmp/package-lock.json").packages["node_modules/playwright"].version')" \
  && DEBIAN_FRONTEND=noninteractive npm exec --ignore-scripts --yes \
    --package="playwright@$playwright_version" -- playwright install-deps chromium \
  && npm cache clean --force \
  && rm -rf /var/lib/apt/lists/*

FROM pull-request-act AS pull-request-runner
ARG RUNNER_VERSION=2.338.2
ARG TARGETARCH
WORKDIR /opt/actions-runner
RUN case "$TARGETARCH" in \
    amd64) architecture=x64; checksum=baebf204307bac6193480852732f0aba2ae97b6c5597c244f4d5558390147c40 ;; \
    arm64) architecture=arm64; checksum=670adb2f268fe21dcbb58b3db0e0aa9d5b3bddfe2c651481336e561ff86de945 ;; \
    *) echo "Unsupported GitHub runner architecture: $TARGETARCH" >&2; exit 1 ;; \
  esac \
  && archive=/tmp/actions-runner.tar.gz \
  && curl -fsSL "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-${architecture}-${RUNNER_VERSION}.tar.gz" -o "$archive" \
  && printf '%s  %s\n' "$checksum" "$archive" | sha256sum -c - \
  && tar -xzf "$archive" \
  && rm "$archive" \
  && DEBIAN_FRONTEND=noninteractive ./bin/installdependencies.sh \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --uid 1001 --user-group --create-home runner \
  && chown -R runner:runner /opt/actions-runner
USER runner
CMD ["./run.sh"]
