import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const email = searchParams.get('email');
    
    if (!firebaseUid && !email) {
      return NextResponse.json(
        { error: 'Firebase UID or email is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: firebaseUid || undefined },
          { email: email || undefined }
        ]
      },
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
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                coverImage: true
              }
            }
          },
          orderBy: {
            requestedAt: 'desc'
          }
        },
        _count: {
          select: {
            borrowings: {
              where: {
                status: {
                  in: ['REQUESTED', 'APPROVED', 'PICKED_UP']
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, firebaseUid, familyId, role } = body;
    
    if (!email || !name || !firebaseUid || !familyId) {
      return NextResponse.json(
        { error: 'Email, name, firebaseUid, and familyId are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { firebaseUid }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or Firebase UID already exists' },
        { status: 400 }
      );
    }
    
    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });
    
    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        firebaseUid,
        familyId,
        role: role || 'MEMBER'
      },
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
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}