import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "super_admin" | "hr_admin" | "employee";
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USERS: Record<string, { password: string; profile: UserProfile }> = {
  "admin@cubit.com": {
    password: "admin123",
    profile: { id: "1", email: "admin@cubit.com", name: "Super Admin", role: "super_admin" },
  },
  "hr@cubit.com": {
    password: "hr123",
    profile: { id: "2", email: "hr@cubit.com", name: "HR Manager", role: "hr_admin" },
  },
  "emp@cubit.com": {
    password: "emp123",
    profile: { id: "3", email: "emp@cubit.com", name: "John Employee", role: "employee" },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cubit-auth-user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("cubit-auth-user", JSON.stringify(profile));
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const entry = MOCK_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      throw new Error("Invalid email or password");
    }
    persistUser(entry.profile);
  };

  const signup = async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (MOCK_USERS[email.toLowerCase()]) {
      throw new Error("Email already exists");
    }
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      email,
      name,
      role: "employee",
    };
    persistUser(profile);
  };

  const loginWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    persistUser({
      id: "google-1",
      email: "user@gmail.com",
      name: "Google User",
      role: "employee",
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cubit-auth-user");
    localStorage.removeItem("cubit-role");
  };

  const forgotPassword = async (email: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!MOCK_USERS[email.toLowerCase()]) {
      throw new Error("No account found with this email");
    }
    // Mock: just resolves successfully
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
