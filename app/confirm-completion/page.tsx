'use client';

import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import { strings } from '@/app/utils/strings';

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
            {strings.instructions.confirmDownloadComplete}
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleBack} variant="secondary" fullWidth>
              {strings.buttons.back}
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