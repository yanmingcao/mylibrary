"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button, Card, CardBody, CardTitle, CardDescription } from '@/components/ui';
import { BorrowBookModal } from '@/components/BorrowBookModal';
import { useAuth } from '@/context/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverImage?: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'WORN';
  isAvailable: boolean;
  family: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  borrowings: Array<{
    id: string;
    borrower: {
      id: string;
      name: string;
      email: string;
    };
    status: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RETURNED';
    requestedAt: string;
    dueDate: string;
  }>;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { dbUser } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Book not found');
        } else {
          throw new Error('Failed to fetch book');
        }
        return;
      }

      const data = await response.json();
      setBook(data);
      setError(null);
    } catch (err) {
      setError('Error loading book details');
      console.error('Error fetching book:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-blue-600 bg-blue-100';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100';
      case 'WORN': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-blue-600 bg-blue-100';
      case 'PICKED_UP': return 'text-green-600 bg-green-100';
      case 'RETURNED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBorrowRequest = () => {
    if (!dbUser) {
      router.push('/login');
      return;
    }

    if (!book || book.family.id === dbUser.family.id) {
      setError('You cannot borrow books from your own family.');
      return;
    }

    setShowBorrowModal(true);
  };

  const handleBorrowSuccess = () => {
    setShowBorrowModal(false);
    fetchBook(); // Refresh to update availability
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Book not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="secondary" 
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back to Books
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Cover and Details */}
          <div>
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg shadow-lg">
                <span className="text-gray-400 text-6xl">📚</span>
              </div>
            )}

            <Card className="mt-6">
              <CardBody>
                <CardTitle className="mb-3">Book Information</CardTitle>
                <div className="space-y-2">
                  {book.isbn && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">ISBN:</span>
                      <span className="ml-2 text-sm text-gray-600">{book.isbn}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Condition:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getConditionColor(book.condition)}`}>
                      {book.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(book.isAvailable ? 'APPROVED' : 'RETURNED')}`}>
                      {book.isAvailable ? 'Available' : 'Currently Borrowed'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Book Details and Actions */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 mb-4">by {book.author}</p>
              
              {book.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>

            {/* Family Information */}
            <Card className="mb-6">
              <CardBody>
                <CardTitle className="mb-3">Shared By</CardTitle>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{book.family.name}</h4>
                  <p className="text-sm text-gray-600">📍 {book.family.address}</p>
                  {book.family.phone && (
                    <p className="text-sm text-gray-600">📞 {book.family.phone}</p>
                  )}
                  {book.family.email && (
                    <p className="text-sm text-gray-600">✉️ {book.family.email}</p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Borrowing Status */}
            {book.borrowings.length > 0 && (
              <Card className="mb-6">
                <CardBody>
                  <CardTitle className="mb-3">Borrowing Status</CardTitle>
                  <div className="space-y-3">
                    {book.borrowings.map((borrowing) => (
                      <div key={borrowing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{borrowing.borrower.name}</p>
                          <p className="text-xs text-gray-500">
                            Requested {new Date(borrowing.requestedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Due {new Date(borrowing.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(borrowing.status)}`}>
                          {borrowing.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {book.isAvailable && book.family.id !== dbUser?.family.id && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBorrowRequest}
                >
                  Request to Borrow
                </Button>
              )}
              
              {book.family.id === dbUser?.family.id && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">This book is from your family</p>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/dashboard')}
                  >
                    Manage Your Books
                  </Button>
                </div>
              )}
              
              {!book.isAvailable && book.family.id !== dbUser?.family.id && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">This book is currently borrowed</p>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/books')}
                  >
                    Browse Other Books
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Borrow Book Modal */}
        {showBorrowModal && (
          <BorrowBookModal
            book={book}
            isOpen={showBorrowModal}
            onClose={() => setShowBorrowModal(false)}
            onSuccess={handleBorrowSuccess}
          />
        )}
      </main>
    </div>
  );
}