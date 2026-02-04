import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';
import { normalizeIsbn } from '@/lib/isbn';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        },
        borrowings: {
          where: {
            status: {
              in: ['REQUESTED', 'APPROVED', 'PICKED_UP']
            }
          },
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            requestedAt: 'desc'
          }
        }
      }
    });
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  try {
    // Verify book belongs to user's family
    const existing = await prisma.book.findUnique({
      where: { id },
      select: { familyId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (existing.familyId !== authResult.user.familyId) {
      return NextResponse.json(
        { error: 'You can only edit books belonging to your family' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      language,
      description,
      coverImage,
      condition,
      isAvailable,
    } = body;

    // Normalize ISBN to ISBN-13 if provided
    const normalizedIsbn = isbn ? (normalizeIsbn(isbn) ?? isbn) : isbn;
    
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(normalizedIsbn !== undefined && { isbn: normalizedIsbn }),
        ...(language !== undefined && { language }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(condition && { condition }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  try {
    // Verify book belongs to user's family (or user is ADMIN)
    const existing = await prisma.book.findUnique({
      where: { id },
      select: { familyId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (existing.familyId !== authResult.user.familyId && authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete books belonging to your family' },
        { status: 403 }
      );
    }

    await prisma.book.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
