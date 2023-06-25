import React, { useEffect } from 'react';

const Devices = ( { connectedIp, setConnectedIp } ) => {

  const [nanoleafDevices, setNanoleafDevices] = React.useState([]);
  const [connectedDevices, setConnectedDevices] = React.useState([]);
  const [selectedDeviceIp, setSelectedDeviceIp] = React.useState("");

  useEffect(() => {
    setSelectedDeviceIp(connectedIp);

    window.nanoleafAPI.getTokens().then(tokens => {

      // add all already connected IPs to nanoleafDevices array
      let connected = [];
      for (const key in tokens) {
        connected = [...connected, key];
      }
      setNanoleafDevices(connected);
      setConnectedDevices(connected);
    });
  }, []);

  const handleFindDevices = (e) => {
    e.preventDefault();

    // Nanoleaf devices are returned in an array with IPs
    window.nanoleafAPI.findDevices().then(devices => {
      setNanoleafDevices(devices);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const handleChange = (ip, event) => {
    if (event.target.checked) {
      setSelectedDeviceIp(ip);

      if (connectedDevices.includes(ip)) {
        setConnectedIp(ip);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // get authentication token with NanoleafAPI
    window.nanoleafAPI.authenticationToken(selectedDeviceIp).then(token => {
      setConnectedIp(selectedDeviceIp);
      setConnectedDevices([...connectedDevices, selectedDeviceIp]);
    }).catch(error => {
      console.log(error);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {nanoleafDevices.map((ip, i) => {
            return (
            <div key={i}>
              <input type="radio" name="devices" value={ip} onChange={(event) => handleChange(ip, event)} checked={selectedDeviceIp === ip} />
              <label>{ip}</label>
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