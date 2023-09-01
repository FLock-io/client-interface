/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import kill from 'tree-kill';
import Pinata from '@pinata/sdk';
import fs from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { execPath } from './binaries';

const pinata = new Pinata(
  '9db9fffc88c7e281b5b2',
  '5c761fe42f8267832f70a1f00430d9f3d9006fc9624e5bce43a44b7edd79f624'
);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let main: ChildProcessWithoutNullStreams;

ipcMain.handle('ipc', async (event, arg) => {
  if (arg[0] === 'uploadToIPFS') {
    const { IpfsHash: schemaHash } = await pinata.pinJSONToIPFS(
      JSON.parse(arg[1])
    );

    const fileName = arg[2].split('\\').pop();
    const fileStream = fs.createReadStream(arg[2]);

    const options = {
      pinataMetadata: {
        // @ts-ignore
        name: fileName,
      },
    };
    const { IpfsHash: fileHash } = await pinata.pinFileToIPFS(
      fileStream,
      options
    );
    return [schemaHash, fileHash];
  }
  return [];
});

ipcMain.on('ipc', async (event, arg) => {
  console.log(`arg: ${arg}`);
  switch (arg[0]) {
    case 'join':
      main = spawn(
        execPath,
        [
          '--flock-token-address',
          '0x95c5746A0E7c73b6Af16048d4e79dA294b8b7116',
          '--task-address',
          arg[1],
          '--ipfs',
          'https://flockio.mypinata.cloud/ipfs/',
          '--rpc',
          'https://polygon-mumbai.g.alchemy.com/v2/O4lTKowPdYQ1XruWzEt5Peb03EzP53P6',
          '--port',
          '6222',
          '--private-key',
          arg[2],
          '--dataset',
          arg[3],
        ],
        {}
      );

      main.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        event.reply('ipc', [arg[1], data.toString()]);
      });

      main.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        if (
          data.toString().includes('insufficient funds for gas * price + value')
        ) {
          event.reply('ipc', [
            arg[1],
            'insufficient funds for gas * price + value',
          ]);
        }
      });

      main.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        event.reply('ipc', [
          arg[1],
          `client exited with code ${code} (0 is success)`,
        ]);
      });
      break;
    case 'leave':
      // @ts-ignore
      kill(main.pid);
      break;
    default:
      break;
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  const splash = new BrowserWindow({
    width: 600,
    height: 420,
    movable: true,
    center: true,
    icon: getAssetPath('icon.png'),
    transparent: true,
    frame: false,
  });

  const splashScreenSrc = app.isPackaged
    ? path.join(process.resourcesPath, 'splash', 'splash.html')
    : path.join(__dirname, '../../splash', 'splash.html');

  splash.loadFile(splashScreenSrc);
  splash.center();
  setTimeout(() => {
    splash.close();
    mainWindow?.center();
    mainWindow?.show();
  }, 8000);

  /*
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });
  */

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
