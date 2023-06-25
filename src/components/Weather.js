import React from 'react';

const Weather = ({ connectedIp }) => {

  const [city, setCity] = React.useState('');

  const handleWeather = (e) => {
    e.preventDefault();
    
    window.nanoleafAPI.setWeatherEffect(connectedIp, city);
  };
  
  return (
    <div>
      <label>
        City: <input value={city} onChange={e => setCity(e.target.value)} />
      </label>
      <button onClick={handleWeather} >Weather Effect</button>
    </div>
  )
};

export default Weather;