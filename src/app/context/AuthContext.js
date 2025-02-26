"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [userDetail, setUserDetail] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const isLoggedIn = !!token;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      const userDetails = localStorage.getItem("userDetails");
      if (storedToken) {
        console.log("token");
        
        setToken(JSON.parse(storedToken)); 
      }else{
        console.log("not token");
        
        router.push("/login")
      }

      if(userDetails){
        setUserDetail(JSON.parse(userDetails));
      }
    }
  }, []);

  const login = async (UserId, Password) => {
    try {
      const response = await axios.post('/api/login', { UserId, Password });
      // const response = {data:{
      //   token:"12345",
      //   data:{
      //     LocationName: "Surat",
      //     UserId: "fbw",
      //     CompanyCode: "1",
      //     UserName: "fjwo",
      //     LocationCode: 2
      // }
      // }}
      if (response.data && response.data.token) {
        localStorage.setItem("authToken", JSON.stringify(response.data.token));
        localStorage.setItem("userDetails", JSON.stringify({...response.data.data, "CompanyCode":"1"}));
        setToken(response.data.token);
        setUserDetail(response.data.data);
        router.push("/");
      } else {
        console.error('No token received from the server');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout,token,isSidebarOpen, setIsSidebarOpen, userDetail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
