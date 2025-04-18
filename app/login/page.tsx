// app/login/page.tsx
import Box from '@/app/components/Box';
import LoginForm from '@/app/components/LoginForm';
import Navbar from '@/app/components/Navbar';

export default function LoginPage() {
  const sections = [
    {
      title: "PairWise Login",
      children: <LoginForm />
    }
  ]
  return (
    <div>
      <Navbar />
      <Box sections={sections} width='md' />
    </div>
  );
}