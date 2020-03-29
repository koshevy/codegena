#!/usr/bin/env bash

branch="$(git symbolic-ref --short -q HEAD)"

if [ "$branch" != "master" ]; then
    echo -e "\033[0;31m";
    echo "╔════════════════════════════════════════════════╗"
    echo "║ Publication MUST be run only in master branch! ║"
    echo "║                                                ║"
    echo "║ Please, make Pull Request in master branch and ║"
    echo "║ continue publishing after PR merging.          ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "\033[0m";
    exit 1;
fi

yarn lint &&
rm -rf dist/* &&
# version update error ignoring because
# there may be unpublished packages with updated version
(./node_modules/.bin/lerna version --conventional-commits --yes --allow-branch --exact master || true) &&
yarn run build:all-libs &&
yarn run test:libs &&

# publish all built libs. errors are ignored
for D in `ls ./dist`
do
    (cd ./dist/${D} && yarn publish --access public && cd ../../) || true
done
