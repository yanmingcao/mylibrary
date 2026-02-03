"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button, Card, CardBody, CardTitle, CardDescription } from '@/components/ui';

interface Family {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
  }>;
  _count: {
    users: number;
    books: number;
  };
}

interface FamiliesResponse {
  families: Family[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFamilies = async (searchQuery = searchTerm, currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/families?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch families');
      }

      const data: FamiliesResponse = await response.json();
      setFamilies(data.families);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Error loading families. Please try again.');
      console.error('Error fetching families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (page === 1) {
        fetchFamilies();
      } else {
        setPage(1); // Reset to page 1 when searching
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFamilies();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">👨‍👩‍👧‍👦 Community Families</h1>
          <p className="text-gray-600 mb-6">See who's sharing books in your neighborhood</p>
        </div>
        
        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Families
            </label>
            <input
              type="text"
              placeholder="Search by family name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Families Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchFamilies()}>Try Again</Button>
          </div>
        ) : families.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm ? 
                'No families found matching your search.' : 
                'No families have joined yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <Card key={family.id} hoverable>
                  <CardBody>
                    <CardTitle className="mb-2">{family.name}</CardTitle>
                    <CardDescription className="mb-4">
                      📍 {family.address}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {family.phone && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">📞</span>
                          {family.phone}
                        </div>
                      )}
                      
                      {family.email && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">✉️</span>
                          <span className="truncate">{family.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">👥</span>
                          {family._count.users} {family._count.users === 1 ? 'member' : 'members'}
                        </div>
                        
                        <div className="flex items-center">
                          <span className="font-medium mr-2">📚</span>
                          {family._count.books} {family._count.books === 1 ? 'book' : 'books'}
                        </div>
                      </div>
                    </div>

                    {/* Family Members */}
                    {family.users.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-gray-700 mb-2">Members:</p>
                        <div className="space-y-1">
                          {family.users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{user.name}</span>
                              {user.role === 'ADMIN' && (
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}