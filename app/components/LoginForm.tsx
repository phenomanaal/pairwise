'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import AccessCodeForm from './AccessCodeForm';
import { useAuth } from '@/app/hooks/useAuth'


const LoginForm = () => {
  const [currentStep, setCurrentStep] = useState<'credentials' | 'accessCode'>('credentials');
  const [username, setUsername] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, verifyAccessCode } = useAuth();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const success = await login(username, oneTimePassword);
        if (success) {
          setCurrentStep('accessCode');
        } else {
          setError('Invalid credentials');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
  const handleBack = () => {
    setCurrentStep('credentials');
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await verifyAccessCode(accessCode);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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