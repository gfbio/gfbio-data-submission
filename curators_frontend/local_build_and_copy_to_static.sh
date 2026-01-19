#!/bin/bash
npm run build &&
mkdir -p ../gfbio_submissions/static/js/curator-ui &&
cp dist/.vite/manifest.json ../gfbio_submissions/static/js/curator-ui/manifest.json &&
cp -r dist/curator-ui/* ../gfbio_submissions/static/js/curator-ui

# TODO: this is for local development; add production build steps if needed
