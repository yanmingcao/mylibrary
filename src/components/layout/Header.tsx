'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">{t('headerTitle')}</span>
            </Link>
          </div>
          
          <nav className="hidden md:ml-10 md:flex md:space-x-8">
            <Link 
              href="/books" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('navBooks')}
            </Link>
            <Link 
              href="/families" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('navFamilies')}
            </Link>
            <Link 
              href="/map" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('navMap')}
            </Link>
            {user && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navAdmin')}
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setLocale(locale === 'zh-Hans' ? 'en' : 'zh-Hans')}
            >
              {locale === 'zh-Hans' ? t('languageEnglish') : t('languageChinese')}
            </button>
            {loading ? (
              <div className="animate-pulse">{t('loading')}</div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {t('welcome')}, {user.displayName || user.email}
                </span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleSignOut}
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
