'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { strings } from '@/app/utils/strings';

interface UseFormSubmitProps {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  onSuccess?: (data: unknown) => void;
  redirectTo?: string;
}

export const useFormSubmit = ({
  endpoint,
  method = 'POST',
  onSuccess,
  redirectTo,
}: UseFormSubmitProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submitForm = async (formData: unknown) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSuccess) onSuccess(data);
        if (redirectTo) router.push(redirectTo);
      } else {
        setError(data.message || strings.errors.generic);
      }
    } catch (err) {
      setError(strings.errors.unexpectedWithDetail.replace('{error}', String(err)));
    } finally {
      setLoading(false);
    }
  };

  return { submitForm, loading, error, setError };
};
