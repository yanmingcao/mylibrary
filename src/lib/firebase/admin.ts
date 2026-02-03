import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const sessionCookieName =
  process.env.FIREBASE_SESSION_COOKIE_NAME ?? "firebase-session";
const sessionCookieExpiresInMs =
  Number(process.env.FIREBASE_SESSION_EXPIRES_DAYS ?? "5") *
  24 *
  60 *
  60 *
  1000;

function getAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
}

function getAdminAuth() {
  return getAuth(getAdminApp());
}

export {
  getAdminApp,
  getAdminAuth,
  sessionCookieName,
  sessionCookieExpiresInMs,
};
