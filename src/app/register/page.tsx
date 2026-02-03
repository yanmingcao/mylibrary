"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    // Join existing family
    joinExistingFamily: false,
    familyId: "",
    // Create new family
    familyName: "",
    familyAddress: "",
    familyPhone: "",
    familyEmail: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        ...(formData.joinExistingFamily 
          ? { familyId: formData.familyId }
          : {
              familyName: formData.familyName,
              familyAddress: formData.familyAddress,
              familyPhone: formData.familyPhone || undefined,
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
        // Auto-login after successful registration
        const loginResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: 'dummy' }) // Will be handled by Firebase
        });
        
        router.push('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-600">
            Join the Victoria Families Community Library and start sharing books.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
              helperText="Must be at least 6 characters"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              required
            />
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Family Information</h2>
            
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="familyOption"
                  checked={formData.joinExistingFamily}
                  onChange={() => updateFormData({ joinExistingFamily: true })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Join an existing family</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="familyOption"
                  checked={!formData.joinExistingFamily}
                  onChange={() => updateFormData({ joinExistingFamily: false })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Create a new family</span>
              </label>
            </div>

            {formData.joinExistingFamily ? (
              <Input
                label="Family ID"
                type="text"
                value={formData.familyId}
                onChange={(e) => updateFormData({ familyId: e.target.value })}
                helperText="Ask your family admin for the Family ID"
                required
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label="Family Name"
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => updateFormData({ familyName: e.target.value })}
                  required
                />
                
                <Input
                  label="Family Address"
                  type="text"
                  value={formData.familyAddress}
                  onChange={(e) => updateFormData({ familyAddress: e.target.value })}
                  helperText="This helps other families find books nearby"
                  required
                />
                
                <Input
                  label="Family Phone (Optional)"
                  type="tel"
                  value={formData.familyPhone}
                  onChange={(e) => updateFormData({ familyPhone: e.target.value })}
                />
                
                <Input
                  label="Family Email (Optional)"
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
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}