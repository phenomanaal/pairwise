'use client';

import Box from '@/app/components/Box';
import WelcomeChecklist from '@/app/components/WelcomeChecklist';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

export default function HomePage() {
  const sections = [
    {
      title: 'Welcome to PairWise',
      children: <WelcomeChecklist />,
    },
  ];

  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width="md" showProgress={true} />
      </div>
    </ProtectedRoute>
  );
}
