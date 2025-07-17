import Box from '@/app/components/Box';
import CurrentFilesList from '@/app/components/CurrentFilesList';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

export default function MatchFilePage() {
  const sections = [
    {
      title: 'List Matching',
      children: <CurrentFilesList matching={true} />,
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
