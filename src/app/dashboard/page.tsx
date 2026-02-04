"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button, Card, CardBody, CardTitle, CardDescription, CardFooter } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  language?: string;
  description?: string;
  coverImage?: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'WORN';
  isAvailable: boolean;
}

interface Borrowing {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
  borrower: {
    id: string;
    name: string;
    email: string;
  };
  status: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RETURNED';
  requestedAt: string;
  dueDate: string;
  returnedAt?: string;
}

export default function DashboardPage() {
  const { dbUser } = useAuth();
  const { t } = useLocale();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [myBorrowings, setMyBorrowings] = useState<Borrowing[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    if (dbUser) {
      fetchDashboardData();
    }
  }, [dbUser]);

  const fetchDashboardData = async () => {
    if (!dbUser) return;

    try {
      const [booksRes, borrowingsRes, pendingRes] = await Promise.all([
        fetch(`/api/books?familyId=${dbUser.family.id}`),
        fetch(`/api/borrowings?borrowerId=${dbUser.id}`),
        fetch(`/api/borrowings?status=REQUESTED`)
      ]);

      const [booksData, borrowingsData, pendingData] = await Promise.all([
        booksRes.json(),
        borrowingsRes.json(),
        pendingRes.json()
      ]);

      setMyBooks(booksData.books || []);
      setMyBorrowings(borrowingsData.borrowings || []);
      
      // Filter pending requests for user's books
      const userBookIds = booksData.books?.map((book: Book) => book.id) || [];
      const userPendingRequests = pendingData.borrowings?.filter((req: Borrowing) => 
        userBookIds.includes(req.book.id) && req.borrower.id !== dbUser.id
      ) || [];
      setPendingRequests(userPendingRequests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowingAction = async (borrowingId: string, action: 'approve' | 'reject' | 'return') => {
    try {
      const status = action === 'return' ? 'RETURNED' : action === 'approve' ? 'APPROVED' : 'RETURNED';
      const response = await fetch(`/api/borrowings/${borrowingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error handling borrowing action:', error);
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

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
              <p className="text-gray-500">{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('dashboardTitle')}</h1>
          <p className="text-gray-600 mb-6">{t('dashboardSubtitle')}</p>
          <p className="text-sm text-gray-500">
            {t('familyLabel')}: <span className="font-medium">{dbUser.family.name}</span> • 
            {t('addressLabel')}: <span className="font-medium">{dbUser.family.address}</span>
          </p>
        </div>
        
        {loading ? (
          <div className="text-center">
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* My Books */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>{t('myBooks')}</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddBookForm(!showAddBookForm)}
                  >
                    {t('addBook')}
                  </Button>
                </div>
                
                {myBooks.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">{t('noBooks')}</p>
                ) : (
                  <div className="space-y-3">
                    {myBooks.map((book) => (
                      <div key={book.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">{book.title}</h4>
                        <p className="text-xs text-gray-600">{book.author}</p>
                        <div className="flex items-center mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(book.isAvailable ? 'APPROVED' : 'RETURNED')}`}>
                            {book.isAvailable ? t('available') : t('borrowed')}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingBook(book)}
                          >
                            {t('edit')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Current Loans */}
            <Card>
              <CardBody>
                <CardTitle>{t('currentLoans')}</CardTitle>
                {myBorrowings.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">{t('noBorrowings')}</p>
                ) : (
                  <div className="space-y-3">
                    {myBorrowings
                      .filter(b => b.status !== 'RETURNED')
                      .map((borrowing) => (
                      <div key={borrowing.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">{borrowing.book.title}</h4>
                        <p className="text-xs text-gray-600">{borrowing.book.author}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getStatusColor(borrowing.status)}`}>
                          {borrowing.status}
                        </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {t('dueDate')}: {new Date(borrowing.dueDate).toLocaleDateString()}
                          </p>
                        {borrowing.status === 'PICKED_UP' && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleBorrowingAction(borrowing.id, 'return')}
                          >
                            {t('returnBook')}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardBody>
                <CardTitle>{t('pendingRequests')}</CardTitle>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">{t('noPendingRequests')}</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">{request.book.title}</h4>
                          <p className="text-xs text-gray-600">{request.borrower.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleBorrowingAction(request.id, 'approve')}
                          >
                            {t('approve')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleBorrowingAction(request.id, 'reject')}
                          >
                            {t('reject')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Add Book Form Modal */}
        {showAddBookForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">{t('addBookTitle')}</h3>
              <AddBookForm 
                familyId={dbUser.family.id} 
                onSuccess={() => {
                  setShowAddBookForm(false);
                  fetchDashboardData();
                }}
                onCancel={() => setShowAddBookForm(false)}
              />
            </div>
          </div>
        )}

        {editingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">{t('editBookTitle')}</h3>
              <EditBookForm
                book={editingBook}
                onSuccess={() => {
                  setEditingBook(null);
                  fetchDashboardData();
                }}
                onCancel={() => setEditingBook(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AddBookForm({ familyId, onSuccess, onCancel }: {
  familyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    language: 'EN',
    description: '',
    coverImage: '',
    condition: 'GOOD' as 'NEW' | 'GOOD' | 'FAIR' | 'WORN'
  });
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'invalid' | 'error'>('idle');

  const handleIsbnLookup = async () => {
    const isbn = formData.isbn.trim();
    if (!isbn) return;

    setLookupStatus('loading');
    try {
      const res = await fetch(`/api/books/lookup?isbn=${encodeURIComponent(isbn)}`);
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          isbn: data.isbn || prev.isbn,
          title: data.title || prev.title,
          author: data.author || prev.author,
          description: data.description || prev.description,
          coverImage: data.coverImage || prev.coverImage,
          language: data.language || prev.language,
        }));
        setLookupStatus('success');
      } else if (res.status === 400) {
        setLookupStatus('invalid');
      } else if (res.status === 404) {
        setLookupStatus('not_found');
      } else {
        setLookupStatus('error');
      }
    } catch {
      setLookupStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          familyId
        })
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('isbnLabel')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.isbn}
            onChange={(e) => { setFormData({ ...formData, isbn: e.target.value }); setLookupStatus('idle'); }}
            placeholder="e.g. 978-0-13-468599-1"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleIsbnLookup}
            disabled={lookupStatus === 'loading' || !formData.isbn.trim()}
          >
            {lookupStatus === 'loading' ? t('isbnLookupLoading') : t('isbnLookup')}
          </Button>
        </div>
        {lookupStatus === 'success' && (
          <p className="text-xs text-green-600 mt-1">{t('isbnLookupSuccess')}</p>
        )}
        {lookupStatus === 'not_found' && (
          <p className="text-xs text-yellow-600 mt-1">{t('isbnLookupNotFound')}</p>
        )}
        {lookupStatus === 'invalid' && (
          <p className="text-xs text-red-600 mt-1">{t('isbnInvalid')}</p>
        )}
        {lookupStatus === 'error' && (
          <p className="text-xs text-red-600 mt-1">{t('isbnLookupError')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('titleLabel')}
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('authorLabel')}
        </label>
        <input
          type="text"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('languageLabel')}
        </label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="EN">English</option>
          <option value="ZH_HANS">Simplified Chinese</option>
          <option value="ZH_HANT">Traditional Chinese</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('conditionLabel')}
        </label>
        <select
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'NEW' | 'GOOD' | 'FAIR' | 'WORN' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NEW">{t('newLabel')}</option>
          <option value="GOOD">{t('goodLabel')}</option>
          <option value="FAIR">{t('fairLabel')}</option>
          <option value="WORN">{t('wornLabel')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('descriptionLabel')}
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('coverImageLabel')}
        </label>
        <input
          type="text"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.coverImage && (
          <div className="mt-2">
            <img src={formData.coverImage} alt="Cover preview" className="h-24 rounded border border-gray-200" />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" fullWidth>
          {t('addBook')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
}

function EditBookForm({ book, onSuccess, onCancel }: {
  book: Book;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? '',
    language: book.language ?? 'EN',
    description: book.description ?? '',
    coverImage: book.coverImage ?? '',
    condition: book.condition
  });
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'invalid' | 'error'>('idle');

  const handleIsbnLookup = async () => {
    const isbn = formData.isbn.trim();
    if (!isbn) return;

    setLookupStatus('loading');
    try {
      const res = await fetch(`/api/books/lookup?isbn=${encodeURIComponent(isbn)}`);
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          isbn: data.isbn || prev.isbn,
          title: data.title || prev.title,
          author: data.author || prev.author,
          description: data.description || prev.description,
          coverImage: data.coverImage || prev.coverImage,
          language: data.language || prev.language,
        }));
        setLookupStatus('success');
      } else if (res.status === 400) {
        setLookupStatus('invalid');
      } else if (res.status === 404) {
        setLookupStatus('not_found');
      } else {
        setLookupStatus('error');
      }
    } catch {
      setLookupStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData
        })
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('isbnLabel')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.isbn}
            onChange={(e) => { setFormData({ ...formData, isbn: e.target.value }); setLookupStatus('idle'); }}
            placeholder="e.g. 978-0-13-468599-1"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleIsbnLookup}
            disabled={lookupStatus === 'loading' || !formData.isbn.trim()}
          >
            {lookupStatus === 'loading' ? t('isbnLookupLoading') : t('isbnLookup')}
          </Button>
        </div>
        {lookupStatus === 'success' && (
          <p className="text-xs text-green-600 mt-1">{t('isbnLookupSuccess')}</p>
        )}
        {lookupStatus === 'not_found' && (
          <p className="text-xs text-yellow-600 mt-1">{t('isbnLookupNotFound')}</p>
        )}
        {lookupStatus === 'invalid' && (
          <p className="text-xs text-red-600 mt-1">{t('isbnInvalid')}</p>
        )}
        {lookupStatus === 'error' && (
          <p className="text-xs text-red-600 mt-1">{t('isbnLookupError')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('titleLabel')}
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('authorLabel')}
        </label>
        <input
          type="text"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('languageLabel')}
        </label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="EN">English</option>
          <option value="ZH_HANS">Simplified Chinese</option>
          <option value="ZH_HANT">Traditional Chinese</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('conditionLabel')}
        </label>
        <select
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'NEW' | 'GOOD' | 'FAIR' | 'WORN' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NEW">{t('newLabel')}</option>
          <option value="GOOD">{t('goodLabel')}</option>
          <option value="FAIR">{t('fairLabel')}</option>
          <option value="WORN">{t('wornLabel')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('descriptionLabel')}
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('coverImageLabel')}
        </label>
        <input
          type="text"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.coverImage && (
          <div className="mt-2">
            <img src={formData.coverImage} alt="Cover preview" className="h-24 rounded border border-gray-200" />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" fullWidth>
          {t('saveChanges')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
}
