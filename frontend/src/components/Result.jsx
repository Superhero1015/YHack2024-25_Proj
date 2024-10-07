import React, { useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js'; // Import html2pdf

function Result({ result, onSubmit }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address.trim() === '') {
      alert('Please enter a valid address');
      return;
    }
    onSubmit(address); // Send the address to the parent App component's handleFormSubmit function
  };

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    setRecommendation('');

    const apiData = {
      soilType: result.soilType,
      avgTemp: result.weatherSummary.avgTemp,
      totalPrecipitation: result.weatherSummary.totalPrecipitation,
      windSpeed: result.weatherSummary.avgWindSpeed,
      latitude: result.latitude,  // Pass latitude
      longitude: result.longitude  // Pass longitude
    };

    try {
      const response = await axios.post('http://localhost:3000/get-crop-recommendation', apiData);
      setRecommendation(response.data.recommendation);
      onSubmit(response.data.result);  // Update the parent with the new result (including daylight)
    } catch (err) {
      setError('Error fetching recommendation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to save the result as a PDF
  const saveAsPdf = () => {
    const element = document.getElementById('result-section');
    const opt = {
      margin: 0.5,
      filename: 'result.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    // Generate and save the PDF
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="result-container">
      <link rel="stylesheet" href="http://localhost:3000/css/style2.css" />

      {/* New Address Search Form */}
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Enter your address"
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      {/* Results */}
      <div id="result-section"> {/* Wrap results in a div to target for PDF generation */}
        <h2>Results for: {result.address}</h2>
        <p>Latitude: {result.latitude}</p>
        <p>Longitude: {result.longitude}</p>

        {/* Soil Information */}
        <p><strong>Soil Information:</strong></p>
        <p>Soil Name: {result.soilName}</p>
        <p>Soil Type: {result.soilType}</p>
        <p>Farm Classification: {result.farmClass}</p>

        {/* Drainage and Runoff */}
        <p><strong>Drainage Class:</strong> {result.drainageClass}</p>
        <p><strong>Runoff:</strong> {result.runoff}</p>

        {/* Water Storage */}
        <p><strong>Available Water Storage (0-25 cm):</strong> {result.aws025wta} cm</p>
        <p><strong>Available Water Storage (0-50 cm):</strong> {result.aws050wta} cm</p>
        <p><strong>Available Water Storage (0-100 cm):</strong> {result.aws0100wta} cm</p>
        <p><strong>Available Water Storage (0-150 cm):</strong> {result.aws0150wta} cm</p>

        {/* Soil Conditions */}
        <p><strong>Slope:</strong> {result.slope}</p>
        <p><strong>Flooding Frequency:</strong> {result.floodFreq}</p>
        <p><strong>Ponding Frequency:</strong> {result.pondingFreq}</p>

        {/* Soil Temperature and Moisture */}
        <p><strong>Average Air Temperature:</strong> {result.avgAirTemp}°C</p>
        <p><strong>Mean Annual Precipitation:</strong> {result.meanAnnualPrecip} mm</p>

        {/* Hydrologic Group */}
        <p><strong>Hydrologic Group:</strong> {result.hydgrpDesc}</p>

        {/* Weather Summary */}
        <p><strong>Average Temperature:</strong> {result.weatherSummary.avgTemp}°C</p>
        <p><strong>Total Precipitation:</strong> {result.weatherSummary.totalPrecipitation} mm</p>

        {/* Sunlight */}
        <p><strong>Average Day Length:</strong> {result.averageDayLength}</p>

        {/* Display Crop Recommendation */}
        {recommendation && (
          <p><strong>Recommended Crop:</strong> {recommendation}</p>
        )}
      </div>

      {/* Save as PDF Button */}
      <button onClick={saveAsPdf}>
        Save as PDF
      </button>

      {/* Button to Fetch Crop Recommendation */}
      <button onClick={fetchRecommendation} disabled={loading}>
        {loading ? 'Loading...' : 'Get Crop Recommendation'}
      </button>

      {/* Display Errors */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Result;
