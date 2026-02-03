"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  firebaseUid: string;
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
  user: User | null;
  dbUser: DatabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function createSessionCookie(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to create session.");
  }
}

async function clearSessionCookie() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = async (firebaseUser: User) => {
    try {
      const response = await fetch(`/api/users?firebaseUid=${firebaseUser.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      console.error("Error fetching database user:", error);
      setDbUser(null);
    }
  };

  const refreshDbUser = async () => {
    if (user) {
      await fetchDbUser(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(true);
      
      if (nextUser) {
        await fetchDbUser(nextUser);
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await createSessionCookie(idToken);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await credential.user.getIdToken();
    await createSessionCookie(idToken);
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionCookie();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      dbUser,
      loading,
      signIn,
      register,
      signOut,
      refreshDbUser,
    }),
    [user, dbUser, loading, signIn, register, signOut, refreshDbUser]
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
