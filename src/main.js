const electron = require('electron')
const open = require('open')
const path = require('path')
const url = require('url')
const windowStateKeeper = require('electron-window-state')
const {app, Menu, MenuItem} = require('electron')
const menu = new Menu()
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 700
  })
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'ComicShelf',
    icon: 'assets/loading.jpg',
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    resizable: false,
    frame: false})
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    open(url)
  })
  mainWindowState.manage(mainWindow)
  var contextMenu = Menu.buildFromTemplate([

        { label: 'Show App', click:  function(){
            mainWindow.show();
        } },
        { label: 'Quit', click:  function(){
            application.isQuiting = true;
            application.quit();

        } }
    ]);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  createWindow();
  menu.append(new MenuItem({
  label: 'DevTools',
  accelerator: 'CmdOrCtrl+D',
  click: () => { mainWindow.webContents.openDevTools() }
  }))

  })

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('browser-window-created',function(e,window) {
      window.setMenu(null);
  });
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
