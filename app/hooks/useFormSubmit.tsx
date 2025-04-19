// hooks/useFormSubmit.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseFormSubmitProps {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  onSuccess?: (data: any) => void;
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

  const submitForm = async (formData: any) => {
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
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { submitForm, loading, error, setError };
};
