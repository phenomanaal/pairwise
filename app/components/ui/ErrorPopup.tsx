'use client';
import Button from './Button';

interface ErrorPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  onContinue: () => void;
  buttonText?: string;
}

const ErrorPopup = ({
  isOpen,
  title,
  message,
  onContinue,
  buttonText = 'Continue',
}: ErrorPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-medium mb-4 text-red-600">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end">
          <Button onClick={onContinue}>{buttonText}</Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;