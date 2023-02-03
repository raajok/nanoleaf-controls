import React from 'react';
import Devices from './components/Devices';

const App = () => {

  const [connectedIp, setConnectedIp] = React.useState("");
  const [authenticationToken, setAuthenticationToken] = React.useState("");

  return (
    <Devices setConnectedIp={setConnectedIp} setAuthenticationToken={setAuthenticationToken} />
  )
};

export default App;