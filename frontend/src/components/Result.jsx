import React from 'react';

function Result({ result }) {
  return (
    <div className="result-container">
      <link rel="stylesheet" href="http://localhost:3000/css/style2.css" />

      <h2>Results for: {result.address}</h2>

      <p><strong>Coordinates:</strong></p>
      <p>Latitude: {result.latitude}</p>
      <p>Longitude: {result.longitude}</p>

      <p><strong>Soil Information:</strong></p>
      <p>Soil Name: {result.soilName}</p>
      <p>Soil Type: {result.soilType}</p>
      <p>Farm Class: {result.farmClass}</p>

      {/* Weather Summary with tooltip */}
      <p className="hover-text">
        <strong>Weather Summary:</strong>
        <span className="tooltip-text">Data gathered from a timeframe of 2020-01-01 to 2023-12-30</span>
      </p>
      <p>Average Temperature: {result.weatherSummary.avgTemp}°C</p>
      <p>Min Temperature: {result.weatherSummary.minTemp}°C</p>
      <p>Max Temperature: {result.weatherSummary.maxTemp}°C</p>
      <p>Total Precipitation: {result.weatherSummary.totalPrecipitation} mm</p>
      <p>Average Wind Speed: {result.weatherSummary.avgWindSpeed} km/h</p>
      <p>Max Wind Speed: {result.weatherSummary.maxWindSpeed} km/h</p>
    </div>
  );
}

export default Result;
