// app/login/page.tsx
import LoginForm from '@/app/components/LoginForm';
import Navbar from '@/app/components/Navbar';

export default function LoginPage() {
  return (
    <div>
      <Navbar />
      <LoginForm />
    </div>
  );
}
