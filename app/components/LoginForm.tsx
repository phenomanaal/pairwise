// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import AccessCodeForm from './AccessCodeForm';

const LoginForm = () => {
  // Step tracking
  const [currentStep, setCurrentStep] = useState<'credentials' | 'accessCode'>('credentials');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !oneTimePassword) {
      setError('Please fill out both fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/pairwise/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, oneTimePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Move to access code step
        setCurrentStep('accessCode');
        setError('');
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle going back to credentials step
  const handleBack = () => {
    setCurrentStep('credentials');
  };

  // Render the credentials form (first step)
  if (currentStep === 'credentials') {
    return (
      <form onSubmit={handleCredentialsSubmit}>
        <FormInput
          id="username"
          label="Username:"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />

        <FormInput
          id="oneTimePassword"
          label="One Time Password:"
          type="password"
          value={oneTimePassword}
          onChange={(e) => setOneTimePassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <ErrorMessage message={error} />

        <Button
          type="submit"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Verifying...' : 'Continue'}
        </Button>
      </form>
    );
  }

  // For the second step, use the existing AccessCodeForm but with some modifications
  return (
    <div>
      <AccessCodeForm redirectPath="/" />
      
      {/* Add back button */}
      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          fullWidth
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;