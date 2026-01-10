import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobileMoneyType: "MVola" | "OrangeMoney";
  role: "client" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  name: string;
  phone: string;
  mobileMoneyType: "MVola" | "OrangeMoney";
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const mockClient: User = {
  id: "1",
  name: "Jean Rakoto",
  email: "jean@example.com",
  phone: "034 12 345 67",
  mobileMoneyType: "MVola",
  role: "client",
};

const mockAdmin: User = {
  id: "2",
  name: "Admin Seramoney",
  email: "admin@seramoney.mg",
  phone: "034 00 000 00",
  mobileMoneyType: "MVola",
  role: "admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem("seramoney-user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const loggedUser = email.includes("admin") ? mockAdmin : mockClient;
    setUser(loggedUser);
    localStorage.setItem("seramoney-user", JSON.stringify(loggedUser));
    setIsLoading(false);
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      mobileMoneyType: data.mobileMoneyType,
      role: "client",
    };
    setUser(newUser);
    localStorage.setItem("seramoney-user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("seramoney-user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
