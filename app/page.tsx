// app/login/page.tsx
import Box from '@/app/components/Box';
import UploadForm from '@/app/components/UploadForm';
import WelcomeChecklist from '@/app/components/WelcomeChecklist';
import Navbar from '@/app/components/Navbar';

export default function HomePage() {
  const sections = [
    {
      title: 'Welcome to PairWise',
      children: <WelcomeChecklist />        
    },
    {
      title: "Upload Voter File",
      children: <UploadForm fileType={"voter"}/>
    }
  ]
  return (
    <div>
      <Navbar />
      <Box sections={sections}/>
    </div>
  );
}

