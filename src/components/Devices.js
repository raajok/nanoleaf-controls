import React from 'react';

const Devices = () => {

  const handleFindDevices = () => {
    // Nanoleaf devices are returned in an array, like so:
    // { name: , ip: , mac: }
    window.nanoleafAPI.findDevices().then(devices => {
      console.log(devices);
    })
    .catch((error) => {
      console.log(error);
    })
  };

  return (
    <button onClick={handleFindDevices}>Find devices</button>
  )
};

export default Devices;