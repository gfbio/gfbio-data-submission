#!/bin/bash
npm run build &&
mv dist/submission-profile-ui/index*.js dist/submission-profile-ui/index.js &&
mv dist/submission-profile-ui/index*.css dist/submission-profile-ui/index.css &&
cp -r dist/submission-profile-ui/ ../gfbio_submissions/static/js

# TODO: this is for local development, add something for production builds, since the names with dynamic parts are important for caching
#   also no collectstatic is done so far
