import React from 'react';
import { useLocation } from "react-router-dom";
import Weather from "./Weather";

const Effects = () => {

  const location = useLocation();

  return (
    <div>
      <p>{location.state?.connectedIp}</p>
      <Weather connectedIp={location.state?.connectedIp} />
    </div>
  )
};

export default Effects;