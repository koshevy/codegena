#!/usr/bin/env bash

branch="$(git symbolic-ref --short -q HEAD)"
releaseMode=''

if [ "$branch" == "master" ]
then
    echo "Starting prerelease publishing..."
    releaseMode="--conventional-prerelease"
else
    if ["$branch" == "release"]
    then
        releaseMode="--conventional-graduate --no-push"
        echo "Starting release publishing..."
    else
        echo -e "\033[0;31m";
        echo "╔════════════════════════════════════════════════╗"
        echo "║ Publication MUST be run only in master branch  ║"
        echo "║ or in release branch!                          ║"
        echo "║                                                ║"
        echo "║ Please, make Pull Request in master branch and ║"
        echo "║ continue publishing after PR merging.          ║"
        echo "╚════════════════════════════════════════════════╝"
        echo -e "\033[0m";
        exit 1;
    fi
fi

rm -rf dist/* &&
# version update error ignoring because
# there may be unpublished packages with updated version
(sh -c "./node_modules/.bin/lerna version --conventional-commits --include-merged-tags --exact --yes $releaseMode" || true) &&
npm run build:all-libs &&

# publish all built libs. errors are ignored
for D in `ls ./dist`
do
    (cd ./dist/${D} && npm publish --access public && cd ../../) || true
done
