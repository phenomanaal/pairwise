// components/AccessCodeForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'

const AccessCodeForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode) {
      setError('Please fill in access code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/pairwise/verify-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/');

      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <p className="pb-6">Check your email for an access code to login to PairWise.</p>
      <div className="mb-4">
        <label htmlFor="access-code" className="block text-sm font-medium text-black">Access Code</label>
        <input
          type="text"
          id="access-code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          className="w-full p-2 border border-black rounded mt-1 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter access code"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
        disabled={loading}
      >
        {loading ? 'Confirming Access Code...' : 'Confirm Code'}
      </button>
    </form>
  );
};

export default AccessCodeForm;
