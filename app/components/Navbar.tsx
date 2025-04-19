'use client';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth'
import { useRouter } from 'next/navigation';;

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white text-black border border-black">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold" passHref>
          PAIRWISE
        </Link>
        <div className="space-x-6 hidden md:flex">
          <Link href="/faq" className="hover:text-gray-400" passHref>
            FAQs
          </Link>
          <Link href="/help" className="hover:text-gray-400" passHref>
            Help
          </Link>
          <Link href="/about" className="hover:text-gray-400" passHref>
            About
          </Link>
          <Link href="/profile" className="hover:text-gray-400" passHref>
            Profile
          </Link>

          <button
            onClick={isAuthenticated ? logout : () => router.push('/login')}
            className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;