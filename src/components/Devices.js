import React from 'react';

const Devices = ( { setConnectedIp } ) => {

  const [nanoleafDevices, setNanoleafDevices] = React.useState([]);
  const [selectedDeviceIp, setSelectedDeviceIp] = React.useState("");

  const handleFindDevices = (e) => {
    e.preventDefault();

    // Nanoleaf devices are returned in an array, like so:
    // { name: , ip: , mac: }
    window.nanoleafAPI.findDevices().then(devices => {
      console.log(devices);
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
    setConnectedIp(selectedDeviceIp);
  };

  return (
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
  )
};

export default Devices;