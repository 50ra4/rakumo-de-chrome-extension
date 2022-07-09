import { defineManifest } from '@crxjs/vite-plugin';
import { version } from './package.json';

const hostUrl = 'https://a-rakumo.appspot.com/attendance/reports';

const extensionName = 'rakumo de extension';

const names = {
  build: extensionName,
  serve: `[DEV] ${extensionName}`,
} as const;

const createIconFileSuffix = (command: 'build' | 'serve') => (command === 'serve' ? '-dev' : '');

// import to `vite.config.ts`
export default defineManifest(({ command, mode, ...manifest }) => ({
  ...manifest,
  version,
  manifest_version: 3,
  name: names[command],
  description: 'Get working hours from rakumo',
  icons: {
    '16': `public/icons/icon16${createIconFileSuffix(command)}.png`,
    '48': `public/icons/icon48${createIconFileSuffix(command)}.png`,
    '128': `public/icons/icon128${createIconFileSuffix(command)}.png`,
  },
  action: {
    default_popup: 'src/popup/index.html',
  },
  options_ui: {
    page: 'src/options/index.html',
  },
  devtools_page: 'src/devTools/index.html',
  author: '50ra4',
  permissions: [
    'storage',
    'background',
    'contextMenus',
    'scripting',
    'activeTab',
    'declarativeContent',
  ],
  content_scripts: [
    {
      matches: [`${hostUrl}/*`],
      js: ['src/content_script.tsx'],
    },
  ],
  background: {
    service_worker: 'src/background.ts',
  },
}));
