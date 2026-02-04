"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { register } = useAuth();
  const { t } = useLocale();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    joinExistingFamily: false,
    familyName: "",
    familyAddress: "",
    familyPhone: "",
    familyEmail: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        ...(formData.joinExistingFamily
          ? { familyName: formData.familyName }
          : {
              familyName: formData.familyName,
              address: formData.familyAddress,
              phone: formData.familyPhone || undefined,
              familyEmail: formData.familyEmail || undefined,
            }),
      };

      await register(payload);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              required
            />

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
          </div>

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

          <Button type="submit" disabled={submitting} variant="primary" fullWidth>
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
