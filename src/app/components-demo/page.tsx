'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardImage,
  CardBody,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/Card';

export default function ComponentsDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    console.log('Form submitted:', { email, password });
  };

  const books = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age.',
      image: 'https://via.placeholder.com/300x400?text=The+Great+Gatsby',
    },
    {
      id: 2,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      image: 'https://via.placeholder.com/300x400?text=To+Kill+a+Mockingbird',
    },
    {
      id: 3,
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian novel about totalitarianism and surveillance.',
      image: 'https://via.placeholder.com/300x400?text=1984',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          UI Components Demo
        </h1>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>

          <div className="mt-6">
            <Button variant="primary" fullWidth>
              Full Width Button
            </Button>
          </div>
        </section>

        {/* Input Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Inputs</h2>
          <form onSubmit={handleSubmit} className="max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              helperText="We'll never share your email"
            />

            <div className="mt-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Minimum 8 characters"
              />
            </div>

            <div className="mt-6">
              <Button type="submit" variant="primary" fullWidth>
                Sign In
              </Button>
            </div>
          </form>
        </section>

        {/* Card Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} hoverable>
                <CardImage src={book.image} alt={book.title} />
                <CardBody>
                  <CardTitle>{book.title}</CardTitle>
                  <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                  <CardDescription>{book.description}</CardDescription>
                </CardBody>
                <CardFooter>
                  <Button variant="primary" size="sm" fullWidth>
                    Borrow
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
