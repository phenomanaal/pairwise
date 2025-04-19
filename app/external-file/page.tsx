// app/external-file/page.tsx
'use client';

import Box from '@/app/components/Box';
import UploadForm from '@/app/components/UploadForm';
import CurrentFilesList from '@/app/components/CurrentFilesList';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { runAuth } from '@/app/hooks/useAuth';

export default function MatchFilePage() {
  const sections = [
    {
      title: 'Current Files:',
      children: <CurrentFilesList />,
    },
    {
      title: 'Upload External File',
      children: <UploadForm fileType={'external'} />,
    },
  ];
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width="md" />
      </div>
    </ProtectedRoute>
  );
}
