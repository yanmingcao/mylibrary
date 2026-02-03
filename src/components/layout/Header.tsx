'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">📚 VicLibrary</span>
            </Link>
          </div>
          
          <nav className="hidden md:ml-10 md:flex md:space-x-8">
            <Link 
              href="/books" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Books
            </Link>
            <Link 
              href="/families" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Families
            </Link>
            <Link 
              href="/map" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Map
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Welcome, {user.displayName || user.email}</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {/* TODO: Implement logout */}}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}