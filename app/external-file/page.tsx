// app/external-file/page.tsx
import Box from '@/app/components/Box';
import UploadForm from '@/app/components/UploadForm';
import CurrentFilesList from '@/app/components/CurrentFilesList';
import Navbar from '@/app/components/Navbar';

export default function MatchFilePage() {
  const sections = [
    {
      title: 'Current Files:',
      children: <CurrentFilesList />        
    },
    {
      title: "Upload External File",
      children: <UploadForm fileType={"external"}/>
    }
  ]
  return (
    <div>
      <Navbar />
      <Box sections={sections}/>
    </div>
  );
}