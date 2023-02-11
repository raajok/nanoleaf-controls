import React from 'react';
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Devices from './components/Devices';
import Effects from './components/Effects';

const App = () => {

  const [connectedIp, setConnectedIp] = React.useState("");
  const [authenticationToken, setAuthenticationToken] = React.useState("");

  return (
    <HashRouter>
      <div>
        <nav>
          <ul>
            <li>
              {/*
                State has to be put twice because Devices is the home directory.
                Route is only rendered once, so the state needs to be put in the Link component too.
               */}
              <Link to="/" state={{
                setConnectedIp: setConnectedIp,
                setAuthenticationToken: setAuthenticationToken
              }}>Devices</Link>
            </li>
            <li>
              <Link to="/effects" state={{
                connectedIp: connectedIp,
                authenticationToken: authenticationToken
              }}>Effects</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Devices setConnectedIp={setConnectedIp} setAuthenticationToken={setAuthenticationToken} />} />
          <Route path="/effects" element={<Effects />} />
        </Routes>
      </div>
    </HashRouter>
  )
};

export default App;