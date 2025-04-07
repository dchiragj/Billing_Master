"use client"
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Dashboard = () => {
  const { setIsSidebarOpen } = useAuth();

  return (
    <div className="h-full">
      {/* <div className="p-4 md:p-6"> */}
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900 p-2 mb-4 rounded-lg hover:bg-gray-100"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FontAwesomeIcon icon={faAlignLeft} className="text-lg" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to the Dashboard!</h1>
      </div>
    // </div>
  );
};

export default Dashboard;