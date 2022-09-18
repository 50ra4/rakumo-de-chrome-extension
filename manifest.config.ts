import { defineManifest } from '@crxjs/vite-plugin';
import { version, author } from './package.json';

const extensionName = 'rakumo de extension';

const EXTENSION_NAMES = {
  build: extensionName,
  serve: `[DEV] ${extensionName}`,
} as const;

const createIconFileSuffix = (command: 'build' | 'serve') => (command === 'serve' ? '-dev' : '');

// import to `vite.config.ts`
export default defineManifest(({ command, mode, ...manifest }) => ({
  ...manifest,
  version,
  manifest_version: 3,
  name: EXTENSION_NAMES[command],
  description: 'rakumoから勤務時間情報を楽々に取得するChrome拡張機能',
  icons: {
    '16': `public/logo/icon16${createIconFileSuffix(command)}.png`,
    '48': `public/logo/icon48${createIconFileSuffix(command)}.png`,
    '128': `public/logo/icon128${createIconFileSuffix(command)}.png`,
  },
  action: {
    default_popup: 'popup.html',
  },
  options_ui: {
    page: 'options.html',
  },
  author,
  permissions: [
    // FIXME:
    'storage',
    'background',
    'contextMenus',
    'scripting',
    'activeTab',
    'declarativeContent',
  ],
  content_scripts: [],
  background: {
    service_worker: 'src/background.ts',
  },
}));
