import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

const getFriendlyAuthError = (error: any, fallbackMessage: string) => {
  const code = error?.code as string | undefined;

  if (code === "auth/configuration-not-found") {
    return "Firebase Authentication is not configured for this project. Enable Email/Password sign-in in the Firebase Console, then try again.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled in Firebase Authentication. Enable it in the Firebase Console, then try again.";
  }

  return error?.message || fallbackMessage;
};

interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: "user";
}

type LocalSession = { user: AppUser } | null;

interface AuthContextType {
  user: AppUser | null;
  session: LocalSession;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (fullName: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<LocalSession>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildUser = (fbUser: { uid: string; email: string | null; displayName: string | null }, fullName?: string): AppUser => ({
    id: fbUser.uid,
    email: fbUser.email || "",
    fullName: fullName || fbUser.displayName || fbUser.email?.split("@")[0] || "",
    role: "user",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }
      const optimisticUser = buildUser(fbUser);
      setUser(optimisticUser);
      setSession({ user: optimisticUser });
      setLoading(false);

      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (userDoc.exists()) {
        const fullName = (userDoc.data().name as string) || optimisticUser.fullName;
        const hydratedUser = { ...optimisticUser, fullName };
        setUser(hydratedUser);
        setSession({ user: hydratedUser });
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) return { error: "Email and password are required" };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const immediateUser = buildUser(cred.user);
      setUser(immediateUser);
      setSession({ user: immediateUser });
      setLoading(false);
      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthError(err, "Sign-in failed") };
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    if (!fullName || !email || !password) return { error: "All fields are required" };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: fullName,
        email,
        createdAt: serverTimestamp(),
      });
      return {};
    } catch (err: any) {
      return { error: getFriendlyAuthError(err, "Sign-up failed") };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
};
