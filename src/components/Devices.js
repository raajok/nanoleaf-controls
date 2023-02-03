import React from 'react';

const Devices = ( { setConnectedIp, setAuthenticationToken } ) => {

  const [nanoleafDevices, setNanoleafDevices] = React.useState([]);
  const [selectedDeviceIp, setSelectedDeviceIp] = React.useState("");

  const handleFindDevices = (e) => {
    e.preventDefault();

    // Nanoleaf devices are returned in an array, like so:
    // { name: , ip: , mac: }
    window.nanoleafAPI.findDevices().then(devices => {
      setNanoleafDevices(devices);
    })
    .catch((error) => {
      console.log(error);
    })
  };

  const handleChange = (ip, event) => {
    if (event.target.checked) {
      setSelectedDeviceIp(ip);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // get authentication token with NanoleafAPI
    window.nanoleafAPI.authenticationToken(selectedDeviceIp).then(token => {
      setAuthenticationToken(token);
      setConnectedIp(selectedDeviceIp);
    }).catch(error => {
      console.log(error);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {nanoleafDevices.map((device, i) => {
            return (
            <div key={i}>
              <input type="radio" name="devices" value={device.name} onChange={(event) => handleChange(device.ip, event)} />
              <label>{device.name}</label>
            </div>
            )
          })}
        </div>
        <button onClick={handleFindDevices}>Find devices</button>
        <input type="submit" value="Connect" />
      </form>
      <p>Before connecting, hold the on-off button down for 5-7 seconds until the LED starts flashing in a pattern.</p>
    </div>
  )
};

export default Devices;