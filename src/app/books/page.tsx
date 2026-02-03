"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button, Input, Card, CardImage, CardBody, CardTitle, CardDescription, CardFooter } from '@/components/ui';
import { BorrowBookModal } from '@/components/BorrowBookModal';
import { useAuth } from '@/context/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'WORN';
  isAvailable: boolean;
  family: {
    id: string;
    name: string;
    address: string;
  };
}

interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function BooksPage() {
  const { dbUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const fetchBooks = async (searchQuery = searchTerm, currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(showAvailableOnly && { available: 'true' })
      });

      const response = await fetch(`/api/books?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data: BooksResponse = await response.json();
      setBooks(data.books);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Error loading books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (page === 1) {
        fetchBooks();
      } else {
        setPage(1); // Reset to page 1 when searching
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, showAvailableOnly]);

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-blue-600 bg-blue-100';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100';
      case 'WORN': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBorrowRequest = (book: Book) => {
    if (!dbUser) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }
    
    // Can't borrow own books
    if (book.family.id === dbUser.family.id) {
      setError('You cannot borrow books from your own family.');
      return;
    }
    
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const handleBorrowSuccess = () => {
    // Refresh the books list to update availability
    fetchBooks();
    setSelectedBook(null);
    setShowBorrowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Browse Books</h1>
          <p className="text-gray-600 mb-6">Discover books shared by families in your community</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by title, author, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">Available only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchBooks()}>Try Again</Button>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm || showAvailableOnly ? 
                'No books found matching your criteria.' : 
                'No books available yet.'}
            </p>
            {!searchTerm && !showAvailableOnly && (
              <Link href="/dashboard">
                <Button variant="primary">Add Your First Book</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} hoverable>
                  <Link href={`/books/${book.id}`}>
                    {book.coverImage ? (
                      <CardImage 
                        src={book.coverImage} 
                        alt={book.title}
                        className="h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
                        <span className="text-gray-400 text-4xl">📚</span>
                      </div>
                    )}
                    <CardBody>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg flex-1">{book.title}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(book.condition)}`}>
                          {book.condition}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                      {book.description && (
                        <CardDescription className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {book.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="font-medium">{book.family.name}</span>
                        <span className="mx-2">•</span>
                        <span className="text-xs">{book.family.address}</span>
                      </div>
                    </CardBody>
                  </Link>
                  <CardFooter>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      fullWidth
                      disabled={!book.isAvailable}
                      className={!book.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                      onClick={() => handleBorrowRequest(book)}
                    >
                      {book.isAvailable ? 'Request to Borrow' : 'Not Available'}
                    </Button>
                  </CardFooter>
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

        {/* Borrow Book Modal */}
        {selectedBook && showBorrowModal && (
          <BorrowBookModal
            book={selectedBook}
            isOpen={showBorrowModal}
            onClose={() => {
              setShowBorrowModal(false);
              setSelectedBook(null);
            }}
            onSuccess={handleBorrowSuccess}
          />
        )}
      </main>
    </div>
  );
}