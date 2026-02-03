import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const borrowerId = searchParams.get('borrowerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (bookId) where.bookId = bookId;
    if (borrowerId) where.borrowerId = borrowerId;
    if (status) where.status = status;
    
    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        include: {
          book: {
            include: {
              family: {
                select: {
                  id: true,
                  name: true,
                  address: true
                }
              }
            }
          },
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
        },
        skip,
        take: limit
      }),
      prisma.borrowing.count({ where })
    ]);
    
    return NextResponse.json({
      borrowings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch borrowings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, borrowerId, dueDate } = body;
    
    if (!bookId || !borrowerId || !dueDate) {
      return NextResponse.json(
        { error: 'BookId, borrowerId, and dueDate are required' },
        { status: 400 }
      );
    }
    
    // Check if book is available
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });
    
    if (!book || !book.isAvailable) {
      return NextResponse.json(
        { error: 'Book is not available for borrowing' },
        { status: 400 }
      );
    }
    
    // Check if user already has an active borrowing for this book
    const existingBorrowing = await prisma.borrowing.findFirst({
      where: {
        bookId,
        borrowerId,
        status: {
          in: ['REQUESTED', 'APPROVED', 'PICKED_UP']
        }
      }
    });
    
    if (existingBorrowing) {
      return NextResponse.json(
        { error: 'You already have an active borrowing request for this book' },
        { status: 400 }
      );
    }
    
    const borrowing = await prisma.borrowing.create({
      data: {
        bookId,
        borrowerId,
        dueDate: new Date(dueDate)
      },
      include: {
        book: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(borrowing, { status: 201 });
  } catch (error) {
    console.error('Error creating borrowing:', error);
    return NextResponse.json(
      { error: 'Failed to create borrowing' },
      { status: 500 }
    );
  }
}