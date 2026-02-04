import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      // The URL user will visit to reset password
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    // Note: Firebase doesn't throw errors for non-existent emails for security
    // The email simply won't be sent if the email doesn't exist
    
    return NextResponse.json({
      message: 'If this email is registered, you will receive a password reset link.',
      // In development, you might want to return this for testing:
      // resetLink
    });
  } catch (error) {
    console.error('Error sending password reset:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset link' },
      { status: 500 }
    );
  }
}
