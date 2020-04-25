#!/usr/bin/env bash

branch="$(git symbolic-ref --short -q HEAD)"
releaseMode=''

if [ "$branch" == "master" ]
then
    echo "Sterting pre-publishing..."
    releaseMode="--conventional-prerelease"
else
    if ["$branch" == "release"]
    then
        releaseMode="--conventional-graduate --no-push"
        echo "Sterting publishing..."
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
yarn run test:libs &&
# version update error ignoring because
# there may be unpublished packages with updated version
(sh -c "./node_modules/.bin/lerna version --amend --conventional-commits --yes $releaseMode" || true) &&
yarn run build:all-libs &&
yarn run test:libs &&

# publish all built libs. errors are ignored
for D in `ls ./dist`
do
    (cd ./dist/${D} && yarn publish --access public && cd ../../) || true
done
