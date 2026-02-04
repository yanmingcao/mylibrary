import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      firebaseUid,
      familyId,
      familyName,
      address,
      phone,
      familyEmail,
    } = body;
    
    // For Google sign-in, firebaseUid is provided instead of password
    if (!email || !name || (!password && !firebaseUid)) {
      return NextResponse.json(
        { error: 'Email, name, and either password or firebaseUid are required' },
        { status: 400 }
      );
    }

    // If familyId is not provided, create a new family
    let targetFamilyId = familyId;

    if (!targetFamilyId && familyName && address) {
      try {
        const newFamily = await prisma.family.create({
          data: {
            name: familyName,
            address,
            phone,
            email: familyEmail,
          },
        });
        targetFamilyId = newFamily.id;
      } catch (error: any) {
        if (error?.code === "P2002") {
          return NextResponse.json(
            { error: "Family name already exists. Join the existing family instead." },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    if (!targetFamilyId && familyName && !address) {
      const existingFamily = await prisma.family.findFirst({
        where: { name: familyName },
        select: { id: true },
      });

      if (!existingFamily) {
        return NextResponse.json(
          { error: "Family not found. Create a new family with an address." },
          { status: 404 }
        );
      }

      targetFamilyId = existingFamily.id;
    }
    
    if (!targetFamilyId) {
      return NextResponse.json(
        { error: 'Either familyId or familyName and address are required' },
        { status: 400 }
      );
    }

    // Create Firebase user (skip if already authenticated via Google)
    let finalFirebaseUid = firebaseUid;
    if (!finalFirebaseUid) {
      const adminAuth = getAdminAuth();
      const firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName: name
      });
      finalFirebaseUid = firebaseUser.uid;
    }

    // Create database user
    const dbUser = await prisma.user.create({
      data: {
        email,
        name,
        firebaseUid: finalFirebaseUid,
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
        uid: finalFirebaseUid,
        email: dbUser.email,
        displayName: dbUser.name
      },
      dbUser
    }, { status: 201 });
  } catch (error: any) {
    const errorPayload = {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
      details: error,
    };
    console.error('Error registering user:', errorPayload);
    
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
