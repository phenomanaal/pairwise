'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        const authenticated = await checkAuth();
        if (!authenticated) {
          router.push('/login');
          return;
        }
      }
      setIsVerified(true);
    };

    if (!loading) {
      verifyAuth();
    }
  }, [checkAuth, isAuthenticated, loading, router]);

  if (loading || !isVerified) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return <>{children}</>;
};

export default ProtectedRoute;