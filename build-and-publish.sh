#!/usr/bin/env bash

yarn lint &&
rm -rf dist/* &&
# version update error ignoring because
# there may be unpublished packages with updated version
(./node_modules/.bin/lerna version --conventional-commits || true) &&
yarn run build:all-libs &&
yarn run test:libs &&

# publish all built libs. errors are ignored
for D in `ls ./dist`
do
    (cd ./dist/${D} && yarn publish --access public && cd ../../) || true
done
