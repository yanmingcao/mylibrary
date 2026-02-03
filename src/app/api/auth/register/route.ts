import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, familyId, familyName, address, phone, familyEmail } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // If familyId is not provided, create a new family
    let targetFamilyId = familyId;
    
    if (!targetFamilyId && familyName && address) {
      // Create new family
      const newFamily = await prisma.family.create({
        data: {
          name: familyName,
          address,
          phone,
          email: familyEmail
        }
      });
      targetFamilyId = newFamily.id;
    }
    
    if (!targetFamilyId) {
      return NextResponse.json(
        { error: 'Either familyId or familyName and address are required' },
        { status: 400 }
      );
    }

    // Create Firebase user
    const adminAuth = getAdminAuth();
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: name
    });

    // Create database user
    const dbUser = await prisma.user.create({
      data: {
        email,
        name,
        firebaseUid: firebaseUser.uid,
        familyId: targetFamilyId,
        role: 'MEMBER'
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

    return NextResponse.json({
      firebaseUser: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      },
      dbUser
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    // Handle Firebase specific errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-exists':
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 400 }
          );
        case 'auth/weak-password':
          return NextResponse.json(
            { error: 'Password is too weak' },
            { status: 400 }
          );
        case 'auth/invalid-email':
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: 'Firebase error: ' + error.message },
            { status: 500 }
          );
      }
    }
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists in the database' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}