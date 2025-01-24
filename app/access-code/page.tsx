// app/login/page.tsx
import AccessCodeForm from '@/app/components/AccessCodeForm';
import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';

export default function AccessCodePage() {
  const sections = [
    {
      title: "PairWise Login",
      children: <AccessCodeForm />
    }
  ];
  return (
    <div>
      <Navbar />
      <Box sections={sections}>
      </Box>
    </div>
  );
}
