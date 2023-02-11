import React from 'react';
import { useLocation } from "react-router-dom";

const Effects = () => {

  const location = useLocation();

  return (
    <div>{location.state?.connectedIp + " " + location.state?.authenticationToken}</div>
  )
};

export default Effects;