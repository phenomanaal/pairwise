'use client';
import React from 'react';
import { useState } from 'react';
import Button from './ui/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

const Confirmation = ({}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const onFinish = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    logout();
    router.push('/login');
  };

  const handleFinishClick = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);

    try {
      await onFinish();
    } catch (error) {
      console.error('Error during deletion:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-4">
      <div>
        Please check that all results files have been downloaded successfully,
        and confirm completion
      </div>
      <div className="flex flex-col items-center mt-6">
        <Button onClick={() => setShowConfirmModal(true)} className="px-8">
          Confirm
        </Button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Are you sure?</h3>
            <p className="mb-6">
              Clicking Finish will delete ALL data. This step cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinishClick}
                className="px-4 bg-red-600 hover:bg-red-700"
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent mb-4"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-lg">Deleting all data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Confirmation;
