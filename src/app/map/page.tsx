import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🗺️ Find Books Near You</h1>
          <p className="text-gray-600 mb-6">Locate books available in your neighborhood</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-500">
            Interactive map coming soon...
          </div>
        </div>
      </main>
    </div>
  );
}