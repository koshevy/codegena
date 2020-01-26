#!/usr/bin/env bash

yarn lint &&
rm -rf dist/* && # first clearing before tests
./node_modules/.bin/lerna version --conventional-commits &&
yarn run build:all-libs &&
yarn run test:libs &&
rm -rf dist/* && # second clearing before it builds changed libs
./node_modules/.bin/lerna run build --since $(git describe --abbrev=0 --tags $(git rev-list --tags --skip=1 --max-count=1)) &&
./node_modules/.bin/lerna publish --contents dist
