'use client';

import { useState } from 'react';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import AccessCodeForm from './AccessCodeForm';
import { useAuth } from '@/app/hooks/useAuth';

const LoginForm = () => {
  const [currentStep, setCurrentStep] = useState<'credentials' | 'accessCode'>(
    'credentials',
  );
  const [username, setUsername] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, oneTimePassword);
      if (success) {
        setCurrentStep('accessCode');
      } else {
        setError('Retry TOTP TBD');
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    setCurrentStep('credentials');
  };

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
          autoComplete="new-password"
          required
        />

        <ErrorMessage message={error} />

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Verifying...' : 'Login'}
        </Button>
      </form>
    );
  }

  return (
    <div>
      <AccessCodeForm redirectPath="/" />

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
