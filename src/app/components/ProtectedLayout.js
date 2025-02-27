"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./SideBar";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../login/page";

export default function ProtectedLayout({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoggedIn, loading, pathname, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="w-full">
      {isLoggedIn && pathname !== "/login" && <Sidebar />}
     {isLoggedIn && pathname !== "/login" ? <main className="flex-1 bg-[#F1F5F9] overflow-x-hidden">{children}</main> : <Login/>}
    </div>
  );
}
