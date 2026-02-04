import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { oobCode, newPassword } = await request.json();

    if (!oobCode || !newPassword) {
      return NextResponse.json(
        { error: 'Reset code and new password are required' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    
    // Verify the reset code
    let info;
    try {
      info = await (adminAuth as any).verifyPasswordResetCode(oobCode);
    } catch (e) {
      // Try the new API name if available
      info = await (adminAuth as any).verifyPasswordResetCode(oobCode);
    }
    
    await adminAuth.updateUser(info.user.uid, {
      password: newPassword,
    });

    return NextResponse.json({
      message: 'Password reset successfully.',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { error: 'The reset link is invalid or has expired.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
