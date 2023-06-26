const axios = require('axios');
const find = require('local-devices');
const Store = require('electron-store');

// Set electron-store to not use dot notation, so IP-addresses are usable
const store = new Store({accessPropertiesByDotNotation: false});

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
    console.log("ip: " + ip);
    console.log("token: " + token);

    const token = store.get(ip);
    
    /*
      Color codes for temperature in HSB:
      30+: 0, 100, 71
      20+: 22, 100, 100
      10+: 59, 100, 100
      0+: 0, 0, 100
      -7+: 180, 35, 100
      -13+: 192, 75, 100
      -18+:  215, 100, 100
    */
    // Calculate color code with temperature
    let hue;
    let saturation;
    let brightness;
    if (temperature > 30) {
      hue = 0;
      saturation = 100;
      brightness = 71;
    } else if (temperature > 20) {
      hue = 22;
      saturation = 100;
      brightness = 100;
    } else if (temperature > 10) {
      hue = 59;
      saturation = 100;
      brightness = 100;
    } else if (temperature > 0) {
      hue = 0;
      saturation = 0;
      brightness = 100;
    } else if (temperature > -7) {
      hue = 180;
      saturation = 35;
      brightness = 100;
    } else if (temperature > -13) {
      hue = 192;
      saturation = 75;
      brightness = 100;
    } else {
      hue = 215;
      saturation = 100;
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
      transTime = 0.2;
    } else if (windSpeed > 47) {
      transTime = 0.5;
    } else if (windSpeed > 39) {
      transTime = 0.8;
    } else if (windSpeed > 32) {
      transTime = 1.1;
    } else if (windSpeed > 25) {
      transTime = 1.4;
    } else if (windSpeed > 19) {
      transTime = 1.7;
    } else if (windSpeed > 13) {
      transTime = 2.0;
    } else if (windSpeed > 8) {
      transTime = 2.3;
    } else if (windSpeed > 4) {
      transTime = 2.6;
    } else if (windSpeed > 1) {
      transTime = 2.9;
    } else {
      transTime = 5;
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
              "value": 20
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
              "hue": hue <= 30 ? 0 : hue - 30,
              "saturation": saturation <= 30 ? 0 : saturation - 30,
              "brightness": brightness <= 30 ? 0 : saturation - 30
            }]
          }
        }
      }).then(response => {
        resolve(response.data);
      }).catch(error => {
        reject(error);
      });
    });
  }
};

module.exports = nanoleafAPI;