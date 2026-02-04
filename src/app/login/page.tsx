"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
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
