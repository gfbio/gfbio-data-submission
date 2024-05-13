# DaSS installation,history and notes

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
