import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      familyId,
      familyName,
      address,
      phone,
      familyEmail,
    } = body;

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    let targetFamilyId = familyId as string | undefined;

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
        { error: "Family information is required" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const dbUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        familyId: targetFamilyId,
        role: "MEMBER",
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    const { token, expiresAt } = await createSession(dbUser.id);
    const response = NextResponse.json({ dbUser }, { status: 201 });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error: any) {
    const errorPayload = {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
      details: error,
    };
    console.error("Error registering user:", errorPayload);

    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
