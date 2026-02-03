import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: {
        book: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
            family: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        }
      }
    });
    
    if (!borrowing) {
      return NextResponse.json(
        { error: 'Borrowing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(borrowing);
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch borrowing' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['REQUESTED', 'APPROVED', 'PICKED_UP', 'RETURNED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = { status };
    
    // If returning the book, set returnedAt and make book available
    if (status === 'RETURNED') {
      updateData.returnedAt = new Date();
    }
    
    // If picking up the book, mark it as unavailable
    if (status === 'PICKED_UP') {
      // We'll update the book availability separately
    }
    
    const borrowing = await prisma.borrowing.update({
      where: { id },
      data: updateData,
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
    
    // Update book availability based on status
    await prisma.book.update({
      where: { id: borrowing.bookId },
      data: {
        isAvailable: status === 'RETURNED'
      }
    });
    
    return NextResponse.json(borrowing);
  } catch (error) {
    console.error('Error updating borrowing:', error);
    return NextResponse.json(
      { error: 'Failed to update borrowing' },
      { status: 500 }
    );
  }
}