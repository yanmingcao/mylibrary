"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const oobCode = searchParams.get("oobCode") || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // If no code, redirect to forgot password
  useEffect(() => {
    if (!oobCode) {
      router.push("/forgot-password");
    }
  }, [oobCode, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || t("resetPasswordError"));
      }
    } catch (err) {
      setError(t("resetPasswordError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!oobCode) return null;

  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">{t("resetPasswordTitle")}</h1>
            <p className="text-sm text-gray-600">
              {t("resetPasswordSubtitle")}
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {t("resetPasswordSuccess")}
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
                label={t("newPasswordLabel")}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label={t("confirmNewPasswordLabel")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {submitting ? t("loading") : t("resetPasswordButton")}
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
    </Suspense>
  );
}
