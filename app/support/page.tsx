import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';

export default function SupportPage() {
  const sections = [
    {
      title: 'Support TBD',
      children: <div>TBD</div>,
    },
  ];
  return (
    <div>
      <Navbar />
      <Box sections={sections} width="md" showProgress={false} />
    </div>
  );
}