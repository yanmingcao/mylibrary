"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Forgot password success:', data);
        setSuccess(true);
        setResetLink(data.resetLink || null);
        if (data.resetLink) {
          router.push(data.resetLink);
        }
      } else {
        console.error('Forgot password error:', data);
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError(t("forgotPasswordError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">{t("forgotPasswordTitle")}</h1>
          <p className="text-sm text-gray-600">
            {t("forgotPasswordSubtitle")}
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {t("forgotPasswordSuccess")}
            {resetLink && (
              <div className="mt-3 break-all text-xs text-green-700">
                <span className="font-medium">Reset link: </span>
                <a className="underline" href={resetLink}>
                  {resetLink}
                </a>
              </div>
            )}
            <div className="mt-4">
              <Link 
                href="/login" 
                className="font-medium text-green-600 hover:text-green-700"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label={t("forgotPasswordLabel")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              fullWidth
            >
              {submitting ? t("loading") : t("forgotPasswordButton")}
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <Link className="font-medium text-blue-600 hover:text-blue-700" href="/login">
              {t("backToLogin")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
