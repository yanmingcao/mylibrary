"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  family: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
}

type AuthContextValue = {
  dbUser: DatabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDbUser = useCallback(async () => {
    setLoading(true);
    try {
      const user = await fetchMe();
      setDbUser(user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDbUser();
  }, [refreshDbUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to sign in.");
    }

    await refreshDbUser();
  }, [refreshDbUser]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to register.");
    }

    await refreshDbUser();
  }, [refreshDbUser]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setDbUser(null);
  }, []);

  const value = useMemo(
    () => ({
      dbUser,
      loading,
      signIn,
      register,
      signOut,
      refreshDbUser,
    }),
    [dbUser, loading, signIn, register, signOut, refreshDbUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
