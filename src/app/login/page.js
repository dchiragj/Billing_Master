"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userId && password) {
      setLoading(true);
      try {
        await login(userId, password);
        toast.success("Login successful!"); // Show success toast
      } catch (error) {
        toast.error("Invalid login credentials"); // Show error toast
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter both User ID and Password"); // Show error toast
    }
  };
  return (
    <>
       <div className="flex justify-center items-center h-screen bg-gray-100 w-full">
  <form onSubmit={handleLogin} className="p-10 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full">
    <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
    <input
      type="text"
      placeholder="User Id"
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className="block w-full mb-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="block w-full mb-6 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in"
    />
  <button
            type="submit"
            disabled={loading} // Disable the button when loading
            className="w-full flex justify-center items-center bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in"
          >
            {loading ? (
              // Circular loading spinner
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Login"
            )}
          </button>
  </form>
</div>
    
    </>
  );
};

export default Login;
