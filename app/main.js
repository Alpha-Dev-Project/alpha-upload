const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const unhandled = require('electron-unhandled');

const { getPortsList, generateBoardFromConfig, flashHexFile } = require('./arduino');
const { fetchFile, checkFile, removeFile } = require('./fetch-file');

const prod = app.isPackaged;
const fileName = "/firmware.hex";

unhandled({
	showDialog: true
});

let win;
function createWindow() {
  const width = 700, height = 420;

  win = new BrowserWindow({
    width    : width,
    height   : height,
    minWidth : width,
    minHeight: height,
    maxWidth : width,
    maxHeight: height,
    icon: path.resolve(__dirname, "/icon.ico"),
    frame: false,
    transparent: true,
    // resizable: false,

    webPreferences: {
      devTools: !prod,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // Path when running electron executable
  let pathIndex = 'index.html';

  if (!prod) {
    // Path when running electron in local folder
    pathIndex = '../dist/index.html';
  }

  const appURL = url.format({
    protocol: "file",
    pathname: path.join( __dirname, pathIndex),
    slashes: true,
  });
  win.loadURL(appURL);

  if(!prod) win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('ready-to-show', () => {
    setTimeout(() => getPortsList().then((ports) => win.webContents.send("ports", ports)), 500);
  });

  getPortsList().then((ports) => win.webContents.send("ports", ports));
  setInterval(() => {
    getPortsList().then((ports) => win.webContents.send("ports", ports));
  }, 4000);
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}


// IPC Events //
ipcMain.on('close', (event) => {
  win.close();
});

ipcMain.on('min', (event) => {
  win.minimize();
});

ipcMain.on('version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('linkto', (event, link) => {
  shell.openExternal(link);
});

ipcMain.on('upload', async (event, config) => {
  const filePath = path.join(app.getPath("appData"), fileName)
  const board = generateBoardFromConfig(config);
  if (typeof board === "string") {
    win.webContents.send("upload-ret", board);
    return;
  }

  win.webContents.send("upload-ret", "Fetching file...");
  fetchFile(config.url, filePath).then(() => {
    win.webContents.send("upload-ret", "Checking file...");
    checkFile(filePath).then(() => {
      win.webContents.send("upload-ret", "Flashing file. Please wait...");
      flashHexFile(board, filePath).then(() => {
        win.webContents.send("upload-ret", "Cleaning up...");
        removeFile(filePath).then(() => {
          win.webContents.send("upload-ret", "SUCCESS")
        }).catch(err => {
          win.webContents.send("upload-ret", {text: "Failed to remove file.", error: err})
        });
      }).catch(err => {
        win.webContents.send("upload-ret", {text: "Failed flash file to microcontroller.", error: err})
        removeFile(filePath).catch(err => {
          win.webContents.send("upload-ret", {text: "Failed to remove file.", error: err})
        });
      });
    }).catch(err => {
      win.webContents.send("upload-ret", {text: "Failed to find file.", error: err})
    });
  }).catch(err => {
    win.webContents.send("upload-ret", {text: "Failed to acquire file from source.", error: err})
  });
});

ipcMain.on('try-all', (event, arg) => {
  console.log("try-all arg:", arg);
});
