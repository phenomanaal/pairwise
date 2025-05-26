'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';

interface AccessCodeFormProps {
  redirectPath?: string;
}

const AccessCodeForm = ({
  redirectPath = '/access-code',
}: AccessCodeFormProps) => {
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
      const response = await fetch(
        'http://localhost:3001/pairwise/verify-access-code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessCode }),
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (response.ok) {
        router.push(redirectPath);
      } else {
        if (data.message === 'Invalid access code. Please try again.') { 
          setError('Retry access code TBD');
        } else {
          setError(data.message || 'An error occurred. Please try again.');
         }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="pb-6">
        Check your email access code TBD.
      </p>

      <FormInput
        id="access-code"
        label="Access Code"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        placeholder="Enter access code"
        required
      />

      <ErrorMessage message={error} />

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Confirming Access Code...' : 'Confirm Code'}
      </Button>
    </form>
  );
};

export default AccessCodeForm;
