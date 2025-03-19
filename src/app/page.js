"use client"
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Dashboard = () => {
    const { setIsSidebarOpen } = useAuth();

  return (
    <>
        <div className=" w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
        <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
       <FontAwesomeIcon icon={faAlignLeft} />
      </button>
          <h1 className="text-xl font-bold p-8">Welcome to the Dashboard!</h1>
        </div>
   
    </>
  );
};

export default Dashboard;
