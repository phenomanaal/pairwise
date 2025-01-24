// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !oneTimePassword) {
      setError('Please fill out both fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/pairwise/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, oneTimePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/access-code');

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
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-black">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-black rounded mt-1 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter your username"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="oneTimePassword" className="block text-sm font-medium text-black">One Time Password:</label>
        <input
          type="password"
          id="oneTimePassword"
          value={oneTimePassword}
          onChange={(e) => setOneTimePassword(e.target.value)}
          className="w-full p-2 border border-black rounded mt-1 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter your password"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
