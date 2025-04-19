'use client';

interface ProcessingPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
}

const ProcessingPopup = ({ isOpen, title, message }: ProcessingPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <p className="mb-4">{message}</p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPopup;
