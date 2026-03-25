"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { apiFetch, ApiError } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accountId: string;
}

function sessionUserToAuthUser(sessionUser: unknown): AuthUser | null {
  if (!sessionUser || typeof sessionUser !== "object") {
    return null;
  }

  const record = sessionUser as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : "";
  if (!id) {
    return null;
  }

  return {
    id,
    email: typeof record.email === "string" ? record.email : "",
    firstName: typeof record.firstName === "string" ? record.firstName : "",
    lastName: typeof record.lastName === "string" ? record.lastName : "",
    role: typeof record.role === "string" ? record.role : "",
    accountId: typeof record.accountId === "string" ? record.accountId : "",
  };
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountName: string;
}

interface InviteRegisterPayload {
  inviteToken: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  registerViaInvite: (payload: InviteRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (payload: Partial<Pick<AuthUser, "firstName" | "lastName">>) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userOverrides, setUserOverrides] = useState<Partial<Pick<AuthUser, "firstName" | "lastName">>>({});

  useEffect(() => {
    setUserOverrides({});
  }, [session?.user?.id]);

  const login = async (payload: LoginPayload) => {
    const result = await nextAuthSignIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    if (!result || result.error) {
      throw new ApiError(401, "Unauthorized");
    }
  };

  const register = async (payload: RegisterPayload) => {
    await apiFetch<{ message: string; userId: string; accountId: string }>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
    await login({ email: payload.email, password: payload.password });
  };

  const registerViaInvite = async (payload: InviteRegisterPayload) => {
    await apiFetch<{ message: string; userId: string; accountId: string }>("/auth/register-invite", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
    await login({ email: payload.email, password: payload.password });
  };

  const logout = async () => {
    setUserOverrides({});
    await nextAuthSignOut({ redirect: false });

    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  };

  const updateUser = (payload: Partial<Pick<AuthUser, "firstName" | "lastName">>) => {
    setUserOverrides((current) => ({ ...current, ...payload }));
  };

  const user = useMemo(() => {
    const sessionUser = sessionUserToAuthUser(session?.user);
    return sessionUser ? { ...sessionUser, ...userOverrides } : null;
  }, [session?.user, userOverrides]);

  const isLoading = status === "loading";

  const value = useMemo(
    () => ({ user, isLoading, login, register, registerViaInvite, logout, updateUser }),
    [user, isLoading, login, register, registerViaInvite, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
