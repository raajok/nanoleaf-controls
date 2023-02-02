import React from 'react';
import Devices from './components/Devices';

const App = () => {

  const [connectedIp, setConnectedIp] = React.useState("");

  return (
    <Devices setConnectedIp={setConnectedIp} />
  )
};

export default App;