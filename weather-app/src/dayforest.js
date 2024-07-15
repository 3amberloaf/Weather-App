// DayForecast.js
import React from 'react';
import './dayforcast.css'; // Ensure this CSS file contains your styles

const DayForecast = ({ day, high, low, icon, description, humidity, feels, wind }) => {
  return (
    <div className="day-forecast">
      <h3>{day}</h3>
      <img src={icon} alt="Weather icon" className="weather-icon" />
      <p>{description}</p>
      <p>High: {high}°F</p>
      <p>Low: {low}°F</p>
      <p>Humidity: {humidity}%</p>
      <p>Feels Like: {feels}°F</p>
      <p>Wind Speed: {wind} m/h</p>
    </div>
  );
};

export default DayForecast;
