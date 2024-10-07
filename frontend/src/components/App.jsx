import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import SubmitForm from './SubmitForm';
import Result from './Result';
import axios from 'axios';

function App() {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleFormSubmit = async (address) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    setResultData(null); // Clear previous result data
    console.log('Sending address:', address);
    try {
      const response = await axios.post('http://localhost:3000/submit-address', { address });
      console.log('Received response:', response.data);
      setResultData(response.data); 
      navigate('/results');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('There was an issue processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<SubmitForm onSubmit={handleFormSubmit} />} />
        <Route path="/results" element={
          resultData ? (
            <Result result={resultData} />
          ) : (
            <p>No data available. Please submit a valid address.</p>
          )
        } />
      </Routes>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;

