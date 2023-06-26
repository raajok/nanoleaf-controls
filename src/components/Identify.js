import React from 'react';

const Identify = ({ connectedIp }) => {
  
  const handleClick = (e) => {
    e.preventDefault();
    
    window.nanoleafAPI.setIdentifyEffect(connectedIp);
  };

  return (
    <div>
      <button onClick={handleClick} >Identify</button>
    </div>
  )
};

export default Identify;