"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./SideBar";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../login/page";
import Header from "./Header";

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
    <>
      {isLoggedIn && pathname !== "/login" ? (
        <div className="flex min-h-screen">
          <Sidebar />
          
          <div className="flex-1 flex flex-col lg:ml-[288px] transition-all duration-300 overflow-x-hidden">
            <Header />
            
            <main className="flex-1 pt-[80px] min-h-[calc(100vh-100px)]">
              <div className="h-full p-2 md:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
}