import React from 'react';

function Result({ result }) {
  return (
    <div>
      <h2>Results for: {result.address}</h2>
      <p><strong>Coordinates:</strong></p>
      <p>Latitude: {result.latitude}</p>
      <p>Longitude: {result.longitude}</p>
      <p><strong>Soil Information:</strong></p>
      <p>Soil Name: {result.soilName}</p>
      <p>Soil Type: {result.soilType}</p>
      <p>Farm Class: {result.farmClass}</p>
      <p><strong>Weather Summary:</strong></p>
      <p>Average Temperature: {result.weatherSummary.avgTemp}°C</p>
      <p>Min Temperature: {result.weatherSummary.minTemp}°C</p>
      <p>Max Temperature: {result.weatherSummary.maxTemp}°C</p>
      <p>Total Precipitation: {result.weatherSummary.totalPrecipitation} mm</p>
      <p>Average Wind Speed: {result.weatherSummary.avgWindSpeed} km/h</p>
      <p>Max Wind Speed: {result.weatherSummary.maxWindSpeed} km/h</p>
    </div>
  );
}

