import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        books: {
          include: {
            borrowings: {
              where: {
                status: {
                  in: ['REQUESTED', 'APPROVED', 'PICKED_UP']
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            users: true,
            books: {
              where: { isAvailable: true }
            }
          }
        }
      }
    });
    
    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(family);
  } catch (error) {
    console.error('Error fetching family:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    );
  }
}