"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null); // Initially null to prevent hydration errors
  const [userDetail, setUserDetail] = useState(null); // Initially null for same reason
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Prevents hydration errors
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!token;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get token and user details from localStorage
      const storedToken = localStorage.getItem("authToken");
      const userDetails = localStorage.getItem("userDetails");

      if (storedToken) {
        setToken(JSON.parse(storedToken));
        if (userDetails) {
          setUserDetail(JSON.parse(userDetails));
        }
      } else if (pathname !== "/login") {
        router.push("/login"); // Redirect only if not on /login
      }

      setLoading(false); // Done checking authentication
    }
  }, [pathname, router]);

  const login = async (UserId, Password) => {
    try {
      const response = await axios.post('/api/login', { UserId, Password });

      if (response.data && response.data.token) {
        localStorage.setItem("authToken", JSON.stringify(response.data.token));
        localStorage.setItem("userDetails", JSON.stringify({...response.data.data, "CompanyCode": "1"}));
        setToken(response.data.token);
        setUserDetail(response.data.data);
        router.push("/");
        toast.success("Login successful!"); // Show success toast
      } else {
        toast.error("Invalid login credentials"); // Show error toast
      }
    } catch (error) {
      console.log("Error during login:", error);
       toast.error(error.message || "Invalid login credentials"); // Show error toast
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userDetails");
    setToken(null);
    setUserDetail(null);
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token, isSidebarOpen, setIsSidebarOpen, userDetail, loading }}>
      {!loading && children} {/* Avoid mismatched content by delaying render */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
