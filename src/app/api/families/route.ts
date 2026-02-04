import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          books: {
            where: { isAvailable: true },
            select: {
              id: true
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.family.count({ where })
    ]);
    
    return NextResponse.json({
      families,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, latitude, longitude, phone, email } = body;
    
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }
    
    let family;
    try {
      family = await prisma.family.create({
        data: {
          name,
          address,
          latitude,
          longitude,
          phone,
          email,
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        return NextResponse.json(
          { error: "Family name already exists" },
          { status: 400 }
        );
      }
      throw error;
    }
    
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}
