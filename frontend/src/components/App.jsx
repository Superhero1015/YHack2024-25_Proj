import React, { useState } from 'react';
import SubmitForm from './SubmitForm';
import Result from './Result';
import axios from 'axios';

function App() {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state

  const handleFormSubmit = async (address) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    setResultData(null); // Clear previous result data
    console.log('Sending address:', address);
    try {
      const response = await axios.post('http://localhost:3000/submit-address', { address });
      console.log('Received response:', response.data);
      setResultData(response.data);  // Store the response data for displaying
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('There was an issue processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SubmitForm onSubmit={handleFormSubmit} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultData && (
        <div>
          <h2>Results for: {resultData.address}</h2>
          <p><strong>Coordinates:</strong></p>
          <p>Latitude: {resultData.latitude}</p>
          <p>Longitude: {resultData.longitude}</p>
          <p><strong>Soil Information:</strong></p>
          <p>Soil Name: {resultData.soilName}</p>
          <p>Soil Type: {resultData.soilType}</p>
          <p>Farm Class: {resultData.farmClass}</p>
          <p><strong>Weather Summary:</strong></p>
          <p>Average Temperature: {resultData.weatherSummary.avgTemp}°C</p>
          <p>Min Temperature: {resultData.weatherSummary.minTemp}°C</p>
          <p>Max Temperature: {resultData.weatherSummary.maxTemp}°C</p>
          <p>Total Precipitation: {resultData.weatherSummary.totalPrecipitation} mm</p>
          <p>Average Wind Speed: {resultData.weatherSummary.avgWindSpeed} km/h</p>
          <p>Max Wind Speed: {resultData.weatherSummary.maxWindSpeed} km/h</p>
        </div>
      )}
    </div>
  );
}

export default App;
