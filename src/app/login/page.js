"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); 

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId && password ) {
      login(userId, password);
    } else {
      alert("Invalid login credentials");
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
      className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in"
    >
      Login
    </button>
  </form>
</div>
    
    </>
  );
};

export default Login;
