'use client';


import Box from '@/app/components/Box';
import UploadForm from '@/app/components/UploadForm';
import WelcomeChecklist from '@/app/components/WelcomeChecklist';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


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
  ];


  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width='md' />
      </div>
    </ProtectedRoute>
  );
}