// components/ui/ErrorMessage.tsx
'use client';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return <p className="text-red-500 text-sm mb-4">{message}</p>;
};

export default ErrorMessage;
