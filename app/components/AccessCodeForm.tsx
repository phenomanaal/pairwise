'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import { strings } from '@/app/utils/strings';

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
      setError(strings.errors.pleaseFillAccessCode);
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
          setError(strings.errors.retryAccessCode);
        } else {
          setError(data.message || strings.errors.generic);
         }
      }
    } catch {
      setError(strings.errors.unexpected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="pb-6">
        {strings.instructions.checkEmailForAccessCode}
      </p>

      <FormInput
        id="access-code"
        label={strings.labels.accessCode}
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        placeholder={strings.placeholders.accessCode}
        autoComplete="one-time-code"
        required
      />

      <ErrorMessage message={error} />

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? strings.processing.confirmingAccessCode : strings.buttons.login}
      </Button>
    </form>
  );
};

export default AccessCodeForm;
