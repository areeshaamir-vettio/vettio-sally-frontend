'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <nav className="w-full h-14 bg-white flex items-center justify-between px-6">
      {/* Left Side - Logo and Navigation */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-black">
          <Image
            src="/assets/vettio-logo.png"
            alt="Vettio Logo"
            width={25}
            height={25}
            className="object-contain"
          />
          Vettio
        </Link>


      </div>


      {/* Right Side - Auth Buttons */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          // Authenticated user menu
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {(user?.profile_picture_url || user?.profile_picture) ? (
                <Image
                  src={user.profile_picture_url || user.profile_picture || ''}
                  alt={user.full_name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-[#8952E0] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-medium">
                  {user?.full_name || user?.email || 'User'}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="text-gray-700 hover:text-gray-900"
            >
              Sign out
            </Button>
          </div>
        ) : (
          // Unauthenticated user buttons
          <>
            <Link
              href="/login"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-[#8952E0] text-white px-4 py-2 rounded-md hover:bg-[#7A47CC] transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
