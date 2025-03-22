// app/match-files/page.tsx
import Box from '@/app/components/Box';
import CurrentFilesList from '@/app/components/CurrentFilesList';
import Navbar from '@/app/components/Navbar';

export default function MatchFilePage() {
  const sections = [
    {
      title: 'Current Files:',
          children: <CurrentFilesList matching={true} />        
    }
  ]
  return (
    <div>
      <Navbar />
      <Box sections={sections}/>
    </div>
  );
}