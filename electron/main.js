const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

const URL = 'https://ebenezer-hymnal.netlify.app/'
const isMac = process.platform === 'darwin'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'Himnario Ebenezer',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    backgroundColor: '#FAF8F3'
  })

  mainWindow.loadURL(URL)

  mainWindow.setMenu(null)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
