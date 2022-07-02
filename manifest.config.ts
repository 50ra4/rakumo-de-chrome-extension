import { defineManifest } from '@crxjs/vite-plugin';
import { version } from './package.json';

const extensionName = 'rakumo de extension';

const names = {
  build: extensionName,
  serve: `[INTERNAL] ${extensionName}`,
} as const;

// import to `vite.config.ts`
export default defineManifest(({ command, mode: _, ...manifest }) => ({
  ...manifest,
  version,
  manifest_version: 3,
  name: names[command],
  description: 'Get working hours from rakumo',
  icons: {
    '16': 'public/icons/icon16.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
  },
  options_ui: {
    page: 'src/options/index.html',
  },
  devtools_page: 'src/devtools/index.html',
  author: '50ra4',
  permissions: ['storage'],
  content_scripts: [
    {
      matches: ['https://a-rakumo.appspot.com/*'],
      js: ['src/content_script.tsx'],
    },
  ],
  web_accessible_resources: [
    {
      matches: ['https://a-rakumo.appspot.com/*'],
      resources: ['*'],
    },
  ],
}));
