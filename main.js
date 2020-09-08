const electron = require('electron');

// Module to control application life.
const {app, BrowserWindow, ipcMain, dialog} = electron;

// Developer Dependencies.
const isDev = !app.isPackaged;
if (isDev) {
  require('electron-debug')();
}

// Additional Tooling.
const path = require('path');
const url = require('url');
const fs = require('fs');

// Yaml parser
const yaml = require('yaml');

// Get rid of the deprecated default.
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

/**
 * Create the main application window.
 */
function createWindow() {
  const display = electron.screen.getPrimaryDisplay();
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: display.workArea.width,
    height: display.workArea.height,
    frame: true,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: false, // Disable nodeIntegration for security.
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true, // Protect against prototype pollution.
      worldSafeExecuteJavaScript: true, // https://github.com/electron/electron/pull/24114
      enableRemoteModule: false, // Turn off remote to avoid temptation.
      preload: path.join(app.getAppPath(), 'app/preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), 'app/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
  );

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Extra security filters.
// See also: https://github.com/reZach/secure-electron-template
app.on('web-contents-created', (event, contents) => {
  // Block navigation.
  // https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
  contents.on('will-navigate', (navevent) => {
    navevent.preventDefault();
  });
  contents.on('will-redirect', (navevent) => {
    navevent.preventDefault();
  });

  // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
  contents.on('will-attach-webview', (webevent, webPreferences) => {
    // Strip away preload scripts.
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration.
    webPreferences.nodeIntegration = false;
  });

  // Block new windows from within the App
  // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
  contents.on('new-window', async (newevent) => {
    newevent.preventDefault();
  });
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// =================== Message Handlers =====================

/**
 * Interface loaded.
 */
ipcMain.on('interface_ready', (event, args) => {
  const file = fs.readFileSync('./sample_data/pets.yml', 'utf8');
  let data = yaml.parse(file);

  // Sample useless response.
  data = null;
  mainWindow.webContents.send('initialize_editor', {
    recipe: data,
  });
  return true;
});

/**
 * Load existing recipe file.
 */
ipcMain.on('load_file', (event, args) => {
  const fileNames = dialog.showOpenDialogSync({
    filters: {name: 'Yaml', extensions: ['yaml', 'yml']},
  });

  let responseMessage;
  if (fileNames === undefined) {
    responseMessage = {
      message: 'No file selected',
      file: null,
      recipe: null,
    };
  } else {
    const file = fs.readFileSync(fileNames[0], 'utf8');
    const data = yaml.parse(file);

    responseMessage = {
      message: `Loading File ${fileNames[0]}`,
      file: fileNames[0],
      recipe: data,
    };
  }
  mainWindow.webContents.send('file_loaded', responseMessage);
  return true;
});

/**
 * Save recipe to file.
 */
ipcMain.on('save_file', (event, args) => {
  dialog.showSaveDialog(mainWindow, {
    buttonLabel: 'Export',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
  }).then(
      (success) => {
        if (success.canceled) {
          mainWindow.webContents.send('file_saved', {
            message: 'Save Cancled',
            filePath: null,
          });
          return true;
        }
        const data = yaml.stringify(args.recipe);
        fs.writeFileSync(success.filePath, data, {encoding: 'utf8'});
        mainWindow.webContents.send('file_saved', {
          message: 'Recipe Saved.',
          filePath: success.filePath,
        });
        return true;
      },
      (error) => {
        mainWindow.webContents.send('file_saved', {
          message: `Error saving file: ${error.message}`,
          filePath: null,
        });
      },
  );
});
