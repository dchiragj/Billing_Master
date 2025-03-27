"use client"
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faFileInvoice, faHouse, faMoneyBills, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const { logout, isSidebarOpen, setIsSidebarOpen } = useAuth();
  const currentPath = usePathname();

  return (
    <>
      <div
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-0 lg:translate-x-0 bg-[#F9FAFD] border-r border-gray-200 transition-transform duration-300 z-50 w-[288px] p-4 space-y-6 transform shadow-2xl`}
      >
        <div className="flex flex-col h-full max-h-full">
          <div>
            <p className="text-center font-bold text-xl py-5 text-black border-b-2">
              Billing Master
            </p>
          </div>

          <nav className="h-full overflow-y-auto">
            <div className="w-full flex h-full flex-col justify-between py-10">
              <div className="flex flex-col gap-3 p-1 my-2">
                <Link href="/" >
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 ps-10 py-3 w-full text-base rounded-xl 
                      ${currentPath === "/" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                      transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                  >
                    <FontAwesomeIcon icon={faHouse} />
                    <span className="font-semibold">Dashboard</span>
                  </button>
                </Link>
                <div className="bg-white text-black rounded-xl">
                  <button
                    onClick={() => setIsMasterOpen(!isMasterOpen)}
                    className={`flex items-center gap-3 ps-10 py-3 w-full text-base rounded-xl 
                     transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                  >
                    <FontAwesomeIcon icon={faFileInvoice} />
                    <span className="font-semibold">Master</span>
                    <div className="flex-grow flex justify-end pe-5">
                      {isMasterOpen ?
                        <FontAwesomeIcon icon={faAngleUp} /> : <FontAwesomeIcon icon={faAngleDown} />}
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out mt-2 max-h-0 ${isMasterOpen ? 'max-h-[500px]' : ''}`}>
                    <div className="pl-6 flex flex-col space-y-2">
                      <Link href="/customer-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                          ${currentPath === "/customer-master" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Customer Master</span>
                        </button>
                      </Link>
                      <Link href="/product-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                          ${currentPath === "/product-master" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Product Master</span>
                        </button>
                      </Link>
                      <Link href="/user-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                          ${currentPath === "/user-master" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">User Master</span>
                        </button>
                      </Link>
                      <Link href="/location-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                          ${currentPath === "/location-master" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Location Master</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white text-black rounded-xl">
                  <button
                    onClick={() => setIsBillingOpen(!isBillingOpen)}
                    className={`flex items-center gap-3 ps-10 py-3 w-full text-base rounded-xl 
                    transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                  >
                    <FontAwesomeIcon icon={faMoneyBills} />
                    <span className="font-semibold">Billing</span>
                    <div className="flex-grow flex justify-end pe-5">
                      {isBillingOpen ?
                        <FontAwesomeIcon icon={faAngleUp} /> : <FontAwesomeIcon icon={faAngleDown} />}
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out mt-2 max-h-0 ${isBillingOpen ? 'max-h-[500px]' : ''}`}>
                    <div className="pl-6 flex flex-col space-y-2">
                      <Link href="/invoice-generation">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                              ${currentPath === "/invoice-generation" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                              transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Invoice Generation</span>
                        </button>
                      </Link>
                      <Link href="/bill-payment">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                              ${currentPath === "/bill-payment" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                              transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Bill Payment</span> 
                        </button>
                      </Link>
                      <Link href="/invoice-view">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                              ${currentPath === "/invoice-view" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                              transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">Invoice View</span>
                        </button>
                      </Link>
                      <Link href="/mr-view">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-base rounded-xl 
                              ${currentPath === "/mr-view" ? 'bg-[#E2E7F1] text-black' : 'bg-white text-black'} 
                              transition duration-200 ease-in-out hover:bg-[#E2E7F1]`}
                        >
                          <span className="font-semibold">MR View</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              <Link href="/login">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 ps-10 py-3 w-full text-base rounded-xl text-black bg-white transition duration-200 ease-in-out hover:bg-[#E2E7F1]"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span className="font-semibold">Logout</span>
                </button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
