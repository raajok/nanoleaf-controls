import React from 'react';
import { useLocation } from "react-router-dom";
import Weather from "./Weather";

const Effects = () => {

  const location = useLocation();

  return (
    <div>
      <p>{location.state?.connectedIp + " " + location.state?.authenticationToken}</p>
      <Weather connectedIp={location.state?.connectedIp} authenticationToken={location.state?.authenticationToken} />
    </div>
  )
};

export default Effects;