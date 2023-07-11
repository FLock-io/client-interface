import { platform } from 'os';

// eslint-disable-next-line consistent-return
export default () => {
  // eslint-disable-next-line default-case
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
  }
};
