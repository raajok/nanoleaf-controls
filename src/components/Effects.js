import React from 'react';
import { useLocation } from "react-router-dom";
import Weather from "./Weather";
import Identify from "./Identify";

const Effects = () => {

  const location = useLocation();

  return (
    <div>
      <p>{location.state?.connectedIp}</p>
      <Identify connectedIp={location.state?.connectedIp} />
      <Weather connectedIp={location.state?.connectedIp} />
    </div>
  )
};

export default Effects;