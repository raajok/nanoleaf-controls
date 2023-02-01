import React from 'react';

const App = () => {

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
    <div>
      {"Nanoleaf Controls"}
      <button onClick={handleFindDevices}>Find Nanoleaf Devices</button>
    </div>
    
  )
};

export default App;