const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path');
const Store = require('electron-store');
const find = require('local-devices');
const axios = require('axios');
const { resolve } = require('path');

/*
  Function for finding Nanoleaf devices in the same network
  Searches trough all devices with local-devices module and tests if Nanoleaf API is available
*/
async function handleFindDevices() {
  const devices = await find();
  let promises = [];
  devices.forEach((device) => {
    promises.push(axios({
      method: 'post',
      url: 'http://' + device.ip + ':16021/api/v1/new',
      timeout: 200 // if there is no response in 0.2 seconds, abort request
    })
    .then((response) => {
        // If the POST request returns OK 200, the user had pressed 
        // the start button for 3-7 seconds before running the app.
        return device;
      })
      .catch((error) => {
        // If there is an error response, the IP is for a Nanoleaf-device. Otherwise the device did not get the request.
        if (error.response) {
          return device;
        } else if (error.request) {
          // if no response was received
          return null;
        }
      }));
  });
  
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        let nanoleafDevices = [];
        results.forEach((device) => {
          // device is null if the device didn't have api/v1/new endpoint
          if (device !== null) {
            nanoleafDevices.push(device);
          }
        })
        resolve(nanoleafDevices);
      })
      .catch((error) => {
        reject(error);
      });
    });
}

// Getting the authentication token for a Nanoleaf device
async function handleAuthenticationToken(event, ip) {
  return new Promise((resolve, reject) => {
    axios.post('http://' + ip + ':16021/api/v1/new')
    .then((response) => {
      resolve(response.data.auth_token);
    }).catch((error) => {
      console.log(error.message);
      reject(error);
    });
  });
}

function createWindow () {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  window.removeMenu();
  
  //loading the index.html running at localhost
  window.loadURL('http://localhost:3000');

  window.webContents.openDevTools();
}

app.whenReady().then(() => {
  ipcMain.handle('findDevices', handleFindDevices);
  ipcMain.handle('authenticationToken', handleAuthenticationToken);
  createWindow();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Use electron-store to create and access user settings
const store = new Store();

store.set('userSettings.theme', 'light');