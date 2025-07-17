'use client';

import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';

export default function ConfirmCompletionPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/download');
  };

  const handleConfirm = () => {
    router.push('/finish');
  };

  const sections = [
    {
      title: 'Confirm Completion',
      children: (
        <div>
          <p className="pb-6">
            Please confirm that you have downloaded all results files. Click back to return to the results download screen, or confirm to continue the clean up and exit this PairWise session.
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button onClick={handleConfirm} fullWidth>
              Confirm
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width="md" showProgress={false} />
      </div>
    </ProtectedRoute>
  );
}