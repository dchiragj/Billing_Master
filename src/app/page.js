"use client"
import { useAuth } from "./context/AuthContext";

const Dashboard = () => {
    const { setIsSidebarOpen } = useAuth();

  return (
    <>
        <div className=" w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
        <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
          <h1 className="text-xl font-bold p-8">Welcome to the Dashboard!</h1>
        </div>
   
    </>
  );
};

export default Dashboard;
