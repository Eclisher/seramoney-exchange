import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "ADMIN" | "CLIENT" | string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
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

const formatPhone = (phone: string) => {
  return phone.replace(/\s+/g, "").replace(/^(\+261|261)/, "0");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("seramoney-user");
    const storedToken = localStorage.getItem("seramoney-token");
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("seramoney-user");
        localStorage.removeItem("seramoney-token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);

    try {
      const isEmail = identifier.includes("@");

      const requestBody = isEmail
        ? { email: identifier, password }
        : { phone_number: identifier, password };

      const response = await api.post("/auth/login", requestBody);
      if (!response.data || response.data.success === false) {
        throw new Error(response.data?.message || "Identifiants incorrects");
      }

      const { token, user: userData } = response.data;

      localStorage.setItem("seramoney-token", token);
      localStorage.setItem("seramoney-user", JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error.message ||
          "Erreur de connexion",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        full_name: data.name.trim(),
        phone_number: formatPhone(data.phone),
        email: data.email.trim().toLowerCase(),
        mobile_money_type: data.mobileMoneyType,
        password: data.password,
        
      });

      if (response.data.token) {
        const { token, user: userData } = response.data;
        localStorage.setItem("seramoney-token", token);
        localStorage.setItem("seramoney-user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'inscription";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("seramoney-user");
    localStorage.removeItem("seramoney-token");
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
        isAdmin: user?.role === "ADMIN",
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

