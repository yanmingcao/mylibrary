"use client";

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface BorrowBookModalProps {
  book: {
    id: string;
    title: string;
    author: string;
    family: {
      id: string;
      name: string;
      address: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BorrowBookModal({ book, isOpen, onClose, onSuccess }: BorrowBookModalProps) {
  const { dbUser } = useAuth();
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default due date to 2 weeks from now
  useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    setDueDate(defaultDate.toISOString().split('T')[0]);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) {
      setError('You must be logged in to request a book');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          borrowerId: dbUser.id,
          dueDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to request book');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Request to Borrow Book</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium">{book.title}</h4>
          <p className="text-sm text-gray-600">by {book.author}</p>
          <p className="text-sm text-gray-500 mt-1">
            From: {book.family.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>You can borrow this book for up to 30 days.</p>
            <p>The book owner will be notified of your request.</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Requesting...' : 'Request Book'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}