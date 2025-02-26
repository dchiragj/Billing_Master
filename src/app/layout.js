import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/SideBar";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Billing Master",
  description: "A billing master application",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="w-full">
            <Sidebar/>
            <main className="flex-1 bg-[#F1F5F9] overflow-x-hidden">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
