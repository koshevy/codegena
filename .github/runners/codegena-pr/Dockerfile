ARG NODE_VERSION=24.22.3
ARG NPM_VERSION=12.2.3
ARG CODEQL_VERSION=2.27.5
FROM node:${NODE_VERSION}-slim AS node-base
ARG NPM_VERSION
RUN npm install --global "npm@${NPM_VERSION}" --no-audit --no-fund
FROM ubuntu:26.04
ARG CODEQL_VERSION
ARG TARGETARCH
ENV PATH="/opt/codeql:/root/.local/bin:${PATH}"
COPY --from=node-base /usr/local/lib /usr/local/lib
COPY --from=node-base /usr/local/include /usr/local/include
COPY --from=node-base /usr/local/bin /usr/local/bin
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
RUN pipx install sarif-tools \
  && pipx install semgrep
