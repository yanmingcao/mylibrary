import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashToken, getExpiryDateFromNowMs } from "@/lib/auth/session";

const resetExpiresHours = Number(process.env.RESET_TOKEN_EXPIRES_HOURS ?? "1");

export const runtime = "nodejs";

function getResetLink(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/reset-password?token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({
        message: "If this email is registered, you will receive a password reset link.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = getExpiryDateFromNowMs(resetExpiresHours * 60 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const link = getResetLink(token);

    return NextResponse.json({
      message: "If this email is registered, you will receive a password reset link.",
      resetLink: link,
    });
  } catch (error) {
    console.error("Error sending password reset:", error);
    return NextResponse.json(
      { error: "Failed to send password reset link" },
      { status: 500 }
    );
  }
}
