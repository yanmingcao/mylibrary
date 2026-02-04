"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, signOut } = useAuth();
  const { t } = useLocale();

  // Google pre-fill from URL params (redirected from login page)
  const googleUidFromUrl = searchParams.get("googleUid") || "";
  const emailFromUrl = searchParams.get("email") || "";
  const nameFromUrl = searchParams.get("name") || "";

  const [googleUid, setGoogleUid] = useState(googleUidFromUrl);
  const [formData, setFormData] = useState({
    email: emailFromUrl,
    password: "",
    confirmPassword: "",
    name: nameFromUrl,
    // Join existing family
    joinExistingFamily: false,
    // Create new family
    familyName: "",
    familyAddress: "",
    familyPhone: "",
    familyEmail: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isGoogleAuth = !!googleUid;

  const handleGoogleSignUp = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const { firebaseUser } = await signInWithGoogle();
      setGoogleUid(firebaseUser.uid);
      setFormData((prev) => ({
        ...prev,
        email: firebaseUser.email || prev.email,
        name: firebaseUser.displayName || prev.name,
      }));
      // Sign out so they don't stay half-authenticated until registration completes
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signInError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isGoogleAuth) {
      if (formData.password !== formData.confirmPassword) {
        setError(t("passwordMismatch"));
        return;
      }

      if (formData.password.length < 6) {
        setError(t("passwordTooShort"));
        return;
      }
    } else {
      // Google auth — no password to validate
    }

    setSubmitting(true);

    try {
        const payload = {
          email: formData.email,
          ...(isGoogleAuth
            ? { firebaseUid: googleUid }
            : { password: formData.password }),
          name: formData.name,
          ...(formData.joinExistingFamily 
            ? { familyName: formData.familyName }
            : {
                familyName: formData.familyName,
                address: formData.familyAddress,
                phone: formData.familyPhone || undefined,
                familyEmail: formData.familyEmail || undefined
              }
          )
        };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isGoogleAuth) {
          // Re-sign in with Google to establish the session
          await signInWithGoogle();
        }
        router.push('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t("registerTitle")}</h1>
          <p className="text-sm text-gray-600">
            {t("registerSubtitle")}
          </p>
        </div>

        {!isGoogleAuth && (
          <div className="mb-6">
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignUp}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("signUpWithGoogle")}
            </button>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">{t("orContinueWith")}</span>
              </div>
            </div>
          </div>
        )}

        {isGoogleAuth && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {t("googleAccountLinked")} ({formData.email})
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{t("personalInfo")}</h2>
            
            <Input
              label={t("fullNameLabel")}
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              required
            />
            
            <Input
              label={t("emailLabel")}
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              disabled={isGoogleAuth}
              required
            />
            
            {!isGoogleAuth && (
              <>
                <Input
                  label={t("passwordLabel")}
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  helperText={t("passwordHelper")}
                  required
                />
                
                <Input
                  label={t("confirmPasswordLabel")}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                  required
                />
              </>
            )}
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{t("familyInfo")}</h2>
            
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="familyOption"
                  checked={formData.joinExistingFamily}
                  onChange={() => updateFormData({ joinExistingFamily: true })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{t("joinExistingFamily")}</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="familyOption"
                  checked={!formData.joinExistingFamily}
                  onChange={() => updateFormData({ joinExistingFamily: false })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{t("createNewFamily")}</span>
              </label>
            </div>

            {formData.joinExistingFamily ? (
              <Input
                label={t("familyNameLabel")}
                type="text"
                value={formData.familyName}
                onChange={(e) => updateFormData({ familyName: e.target.value })}
                helperText={t("familyNameHelper")}
                required
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label={t("familyNameLabel")}
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => updateFormData({ familyName: e.target.value })}
                  required
                />
                
                <Input
                  label={t("familyAddressLabel")}
                  type="text"
                  value={formData.familyAddress}
                  onChange={(e) => updateFormData({ familyAddress: e.target.value })}
                  helperText={t("familyAddressHelper")}
                  required
                />
                
                <Input
                  label={t("familyPhoneLabel")}
                  type="tel"
                  value={formData.familyPhone}
                  onChange={(e) => updateFormData({ familyPhone: e.target.value })}
                />
                
                <Input
                  label={t("familyEmailLabel")}
                  type="email"
                  value={formData.familyEmail}
                  onChange={(e) => updateFormData({ familyEmail: e.target.value })}
                />
              </div>
            )}
          </div>

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
            {submitting ? t("creatingAccount") : t("createAccount")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("alreadyHaveAccount")}{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" href="/login">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
