import { app, BrowserWindow, dialog } from 'electron'
import { autoUpdater } from 'electron-updater';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import log from 'electron-log'
import { electronApp, is } from '@electron-toolkit/utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let mainWindow: BrowserWindow | null;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '/icons/favicon.ico'),
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !is.dev,
    },
  });

  mainWindow.maximize();
  // Hide menu bar completely
  mainWindow.setMenu(null);

  // Test active push message to Renderer-process.
 mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
   mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
   mainWindow = null;
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
});

// --- AUTO-UPDATER LOGIC ---
const setupAutoUpdater = () => {
  log.transports.file.level = 'info';
  autoUpdater.logger = log;

  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', (info) => {
    console.log('⬆️ Update available:', info.version);
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version of WageDesk (${info.version}) is available. Do you want to download it now?`,
        buttons: ['Download Now', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
          if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Downloading Update',
              message: 'Downloading update in the background. You will be prompted when it\'s ready to install.',
              buttons: ['OK'],
            });
          }
        }
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message += ` - Downloaded ${progressObj.percent}%`;
    log_message += ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('⬇️ Update downloaded:', info.version);
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'The update has been downloaded. Restart WageDesk to apply the update.',
        buttons: ['Restart Now', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('❌ Update Error:', error);
    if (mainWindow) {
      dialog.showErrorBox('Update Error', `Failed to check for updates: ${error.message}`);
    }
  });

  autoUpdater.checkForUpdates();
};
// --- END AUTO-UPDATER LOGIC ---

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  createMainWindow();

  if (!VITE_DEV_SERVER_URL) {
    setupAutoUpdater();
  }
})
