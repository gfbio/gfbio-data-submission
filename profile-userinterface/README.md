# DEVELOPMENT NOTES:

## Installation of npm packages

1. execute  (in submissions-root/profile-userinterface/)

        npm install

## Develop locally with hot-reloading

1. set valid settings for access to server & api

        (...)  /profile-userinterface/settings.jsx

2. start local django devlopment server (in submissions root directory)

        docker compose -f local.yml up
3. start local vite server for access to js-app-root (in submissions-root/profile-userinterface/)

        npm run dev

## Develop locally in the context of django views

1. set valid settings for access to server & api (any value should work here)
2. start local django devlopment server (in submissions root directory)

        docker compose -f local.yml up
3. everytime modifications to the react app has been made, you need to build & copy to djangos staticfile directory by
   excuting this script (in submissions-root/profile-userinterface/)

        ./local_build_and_copy_to_static.sh


---------------------------------------------------------------------------------

# Installation,history and notes

### confirmed to work locally

- npm install
- npm run dev
- npm run build

### steps to integrate in django view

- pwd -> submission.gfbio.org/profile-userinterface
- npm run build
- cp from dist/assets all to static js/submission-profile-ui
- todo: deal with dynamic names of assets
- adapt javascript block in template
- change build path in vite config
- now a submission-profile-ui is build output
- this dir can be directyl copied to static/js/
- styles may be a problem due to usage of mantine

### initial setup history

- npm install
- npm install @mantine/core @mantine/hooks @mantine/form @mantine/dates dayjs @mantine/notifications @mantine/dropzone
  @mantine/modals @mantine/nprogress\n
- npm install --save-dev postcss postcss-preset-mantine postcss-simple-vars
- add postcss.config.cjs
- https://mantine.dev/guides/vite/
- https://saurabhnativeblog.medium.com/vite-vs-create-react-app-choosing-the-right-tool-for-your-react-js-project-8824411247cd

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast
  Refresh
