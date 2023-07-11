import path from 'path';
import { rootPath as root } from 'electron-root-path';
import { isPackaged } from 'electron-is-packaged';
import getPlatform from './get-platform';

const IS_PROD = process.env.NODE_ENV === 'production';

const binariesPath =
  IS_PROD && isPackaged // the path to a bundled electron app.
    ? path.join(root, './bin')
    : path.join(root, './build', './bin');

// eslint-disable-next-line import/prefer-default-export
export const execPath = path.resolve(
  path.join(binariesPath, getPlatform() === 'win' ? './main.exe' : './main.bin')
);
