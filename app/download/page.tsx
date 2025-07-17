// app/download/page.tsx
import Box from '@/app/components/Box';
import DownloadResults from '@/app/components/DownloadResults';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DownloadPage() {
  const sections = [
    {
      title: 'Download Results',
      children: <DownloadResults />,
    },
  ];

  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width="800px" showProgress={true} />
      </div>
    </ProtectedRoute>
  );
}
