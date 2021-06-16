#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build
cp audio/* docs
mkdir -p docs/wasm/compiled
cp wasm/compiled/* docs/wasm/compiled/
cp tremoloProcessor.js docs/tremoloProcessor.js

git add -A
git commit -m 'deploy'


echo "deploying"
# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push


