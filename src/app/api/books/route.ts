import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeIsbn } from '@/lib/isbn';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const familyId = searchParams.get('familyId');
    const available = searchParams.get('available');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (familyId) {
      where.familyId = familyId;
    }
    
    if (available !== null) {
      where.isAvailable = available === 'true';
    }
    
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          family: {
            select: {
              id: true,
              name: true,
              address: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.book.count({ where })
    ]);
    
    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, isbn, language, description, coverImage, condition, familyId } = body;
    
    if (!title || !author || !familyId) {
      return NextResponse.json(
        { error: 'Title, author, and familyId are required' },
        { status: 400 }
      );
    }

    // Normalize ISBN to ISBN-13 if provided
    const normalizedIsbn = isbn ? (normalizeIsbn(isbn) ?? isbn) : isbn;
    
    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn: normalizedIsbn,
        language,
        description,
        coverImage,
        condition: condition || 'GOOD',
        familyId
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
    
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
