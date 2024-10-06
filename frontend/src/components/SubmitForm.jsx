import React, { useState } from 'react';

function SubmitForm({ onSubmit }) {
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address.trim() === '') {
      alert('Please enter a valid address');
      return;
    }
    onSubmit(address);  // Send the address to the parent App component
  };

  return (
    <div>
      <h1>Enter Your Address for Garden Recommendations</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SubmitForm;
