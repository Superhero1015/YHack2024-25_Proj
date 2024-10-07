import React, { useState } from 'react';

function SubmitForm({ onSubmit }) {
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address.trim() === '') {
      alert('Please enter a valid address');
      return;
    }
    onSubmit(address); // Send the address to the parent App component
  };

  return (
    <div className="container">
      <h1>Cropscape</h1>
      
      {/* Video background */}
      <video autoPlay muted loop id="background-video" className="background-video">
        <source src="http://localhost:3000/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <h2>Enter Your Address for Garden Recommendations</h2>
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
    </div>
  );
}

export default SubmitForm;
