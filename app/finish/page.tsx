import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import Confirmation from '../components/Confirmation'

export default function DownloadPage() {
  const sections = [
    {
      title: 'Confirmation',
          children: <Confirmation/>
    }
  ];
  
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width='30' />
      </div>
    </ProtectedRoute>
  );
}