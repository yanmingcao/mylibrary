"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signOut } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signInError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const { firebaseUser, isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        // No DB record yet — redirect to register with Google info pre-filled
        const params = new URLSearchParams({
          googleUid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
        });
        // Sign out so they don't stay half-authenticated
        await signOut();
        router.push(`/register?${params.toString()}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signInError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">{t("loginTitle")}</h1>
          <p className="text-sm text-gray-600">
            {t("loginSubtitle")}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">
            {t("emailLabel")}
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {t("passwordLabel")}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? t("loading") : t("loginButton")}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">{t("orContinueWith")}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleSignIn}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("signInWithGoogle")}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link className="font-medium text-blue-600 hover:text-blue-700 underline" href="/forgot-password">
            {t("forgotPasswordLink")}
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-600">
          {t("noAccount")}{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" href="/register">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
