const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path');
const Store = require('electron-store');
const axios = require('axios');

const nanoleafAPI = require('./nanoleafApi');

function handleWeatherEffect(event, ip, token, city) {
  // Get weather information of the city from nanoleaf-controls-api server
  axios.get(`http://localhost:3001/weatherapi/${city}`)
    .then(result => {
      console.log(result.data);

      let temperature = result.data.main.temp;
      let windSpeed = result.data.wind.speed;
      // Might be undefined as the API does not include these if it is not raining/snowing
      let rainVolume = typeof result.data.rain === "undefined" ? result.data.rain : 0;
      let snowVolume = typeof result.data.snow === "undefined" ? result.data.snow : 0;

      nanoleafAPI.setWeatherEffect(ip, token, temperature, windSpeed, rainVolume, snowVolume)
        .then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
    }).catch(error => {
      console.log(error.message);
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
  ipcMain.handle('findDevices', nanoleafAPI.handleFindDevices);
  ipcMain.handle('authenticationToken', nanoleafAPI.handleAuthenticationToken);
  ipcMain.handle('weatherEffect', handleWeatherEffect);
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