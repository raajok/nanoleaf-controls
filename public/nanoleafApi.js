const axios = require('axios');
const find = require('local-devices');
const Store = require('electron-store');

const store = new Store({accessPropertiesByDotNotation: false}); // Set electron-store to not use dot notation, so IP-addresses are usable

const NANOLEAF_DEFAULT_PORT = 16021;

const nanoleafAPI = {

  /*
  Function for finding Nanoleaf devices in the same network
  Searches through all devices with local-devices module and tests if Nanoleaf API is available
  */  
  handleFindDevices: async function handleFindDevices() {
    const devices = await find();
    let promises = [];
    devices.forEach((device) => {
      promises.push(axios({
        method: 'post',
        url: 'http://' + device.ip + `:${NANOLEAF_DEFAULT_PORT}/api/v1/new`,
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
              nanoleafDevices.push(device.ip);
            }
          })
          resolve(nanoleafDevices);
        })
        .catch((error) => {
          reject(error);
        });
      });
  },

  // Getting the authentication token for a Nanoleaf device
  handleAuthenticationToken: async function handleAuthenticationToken(event, ip) {
    return new Promise((resolve, reject) => {
      axios.post('http://' + ip + `:${NANOLEAF_DEFAULT_PORT}/api/v1/new`)
      .then((response) => {
        store.set(ip, response.data.auth_token);
        resolve(response.data.auth_token);
      }).catch((error) => {
        console.log(error.message);
        reject(error);
      });
    });
  },

  /* Return all tokens in store in JSON.
    {
      'ip': 'token',
      'ip2': 'token2'
    }
  */
  handleGetTokens: async function handleGetTokens() {
    return store.store; // returns whole store as an object
  },

  // Flash the lights of the Nanoleaf to identify the device
  setIdentifyEffect: async function setIdentifyEffect(event, ip) {
    const token = store.get(ip);

    return new Promise((resolve, reject) => {
      axios({
        method: 'put',
        url: `http://${ip}:${NANOLEAF_DEFAULT_PORT}/api/v1/${token}/identify`,
        timeout: 30000,
      }).then(response => {
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  },

  // Set the weather effect with given temperature, wind speed and rain/snow volume
  setWeatherEffect: async function setWeatherEffect(ip, temperature, windSpeed, rainVolume, snowVolume) {
    const token = store.get(ip);
    
    // Calculate color code with temperature
    let hue;
    let saturation;
    let brightness;
    if (temperature > 30) {
      hue = 3;
      saturation = 99;
      brightness = 100;
    } else if (temperature > 22) {
      hue = 16;
      saturation = 99;
      brightness = 54;
    }else if (temperature > 16) {
      hue = 40;
      saturation = 81;
      brightness = 99;
    } else if (temperature > 10) {
      hue = 55;
      saturation = 67;
      brightness = 100;
    } else if (temperature > 3) {
      hue = 59;
      saturation = 23;
      brightness = 100;
    } else if (temperature > -3) {
      hue = 0;
      saturation = 0;
      brightness = 100;
    } else if (temperature > -8) {
      hue = 179;
      saturation = 20;
      brightness = 100;
    } else if (temperature > -13) {
      hue = 181;
      saturation = 36;
      brightness = 100;
    } else if (temperature > -18) {
      hue = 190;
      saturation = 51;
      brightness = 99;
    } else {
      hue = 198;
      saturation = 63;
      brightness = 100;
    }

    /*
      Wind speed scale (m/s):
      0-1:    Calm
      1-3:    Light Air
      4-7:    Light Breeze	
      8-12:   Gentle Breeze	
      13-18:	Moderate Breeze	
      19-24:	Fresh Breeze
      25-31:  Strong Breeze	
      32-38:	Near Gale
      39-46:	Gale
      47-54:	Severe Gale
      55-63:	Storm
    */
    // calculate transTime (transition time of the flow animation) for nanoleaf with wind speed
    let transTime;
    if (windSpeed > 55) {
      transTime = 5;
    } else if (windSpeed > 47) {
      transTime = 8;
    } else if (windSpeed > 39) {
      transTime = 11;
    } else if (windSpeed > 32) {
      transTime = 14;
    } else if (windSpeed > 25) {
      transTime = 17;
    } else if (windSpeed > 19) {
      transTime = 20;
    } else if (windSpeed > 13) {
      transTime = 23;
    } else if (windSpeed > 8) {
      transTime = 26;
    } else if (windSpeed > 4) {
      transTime = 29;
    } else if (windSpeed > 1) {
      transTime = 35;
    } else {
      transTime = 50;
    }

    return new Promise((resolve, reject) => {
      axios({
        method: 'put',
        url: `http://${ip}:${NANOLEAF_DEFAULT_PORT}/api/v1/${token}/effects`,
        timeout: 30000,
        data: {
          "write": {
            "command": "display",
            "pluginOptions": [{
              "name": "loop",
              "value": true
            }, {
              "name": "transTime",
              "value": transTime
            }, {
                    "name": "direction",
                    "value": "right"
                }],
            "pluginUuid": "027842e4-e1d6-4a4c-a731-be74a1ebd4cf",
            "colorType": "HSB",
            "version": "2.0",
            "animType": "plugin",
            "pluginType": "color",
            "palette": [{
              "hue": hue,
              "saturation": saturation,
              "brightness": brightness
            }, {
              "hue": 0,
              "saturation": 0,
              "brightness": 100
            }]
          }
        }
        /*
          "hue": hue,
              "saturation": saturation !== 0 ? saturation - 30 : saturation + 20,
              "brightness": brightness
        */
      }).then(response => {
        // console.log(response);
        resolve(response.data);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }
};

module.exports = nanoleafAPI;