import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Environment check:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) + '...',
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);
    
    // Check if we can access auth
    try {
      const users = await adminAuth.listUsers(1);
      console.log('Firebase Admin connection OK, found users:', users.users.length);
    } catch (testError: any) {
      console.error('Firebase Admin connection failed:', testError.message);
    }
    
    // Try with explicit settings
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
      handleCodeInApp: true,
    });

    console.log('Password reset link generated:', { email, resetLink });
    
    return NextResponse.json({
      message: 'If this email is registered, you will receive a password reset link.',
      resetLink // Return for testing in development
    });
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    
    // Check for specific Firebase errors
    if (error.code === 'auth/configuration-not-found') {
      return NextResponse.json(
        { error: 'Firebase configuration error: Email provider not enabled', details: error.message },
        { status: 500 }
      );
    }
    
    if (error.code === 'auth/invalid-continue-uri') {
      return NextResponse.json(
        { error: 'Invalid reset URL configuration', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send password reset link', details: error.message },
      { status: 500 }
    );
  }
}