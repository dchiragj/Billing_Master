"use client"
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const {  logout, isSidebarOpen, setIsSidebarOpen } = useAuth();
  const currentPath = usePathname();

  return (
    <>
      <div
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-0 lg:translate-x-0 bg-[#F9FAFD] dark:bg-black border-r border-gray-200 transition-transform duration-300 z-50 w-[288px] p-4 space-y-6 transform shadow-2xl`}
      >
        <div className="flex flex-col h-full max-h-full">
          <div>
            <p className="text-center font-bold text-2xl py-5 text-black dark:text-white border-b-2">
              Billing Master
            </p>
          </div>

          <nav className="h-full overflow-y-auto">
            <div className="w-full flex h-full flex-col justify-between py-10">
              <div className="flex flex-col gap-3 p-1 my-2">
                <Link href="/" >
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 ps-10 py-4 w-full text-lg rounded-xl 
                      ${currentPath === "/" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                      transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                  >
                    <svg
                      className="text-black dark:text-white fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 -960 960 960"
                      width="24"
                    >
                      <path d="M120-840h320v320H120v-320Zm80 80v160-160Zm320-80h320v320H520v-320Zm80 80v160-160ZM120-440h320v320H120v-320Zm80 80v160-160Zm440-80h80v120h120v80H720v120h-80v-120H520v-80h120v-120Zm-40-320v160h160v-160H600Zm-400 0v160h160v-160H200Zm0 400v160h160v-160H200Z" />
                    </svg>

                    <span className="font-semibold">Dashboard</span>
                  </button>
                </Link>
                <div className="bg-white dark:bg-[#1E293A] text-black dark:text-white rounded-xl">
                  <button
                    onClick={() => setIsMasterOpen(!isMasterOpen)}
                    className={`flex items-center gap-3 ps-10 py-4 w-full text-lg rounded-xl 
                     transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                  >
                    <svg  className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                      <path d="M280-280h80v-400h-80v400Zm320-80h80v-320h-80v320ZM440-480h80v-200h-80v200ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
                    </svg>
                    <span className="font-semibold">Master</span>
                    <div className="flex-grow flex justify-end pe-5">
                      {isMasterOpen ?
                        <svg className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" /></svg> :
                        <svg className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>}
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out mt-2 max-h-0 ${isMasterOpen ? 'max-h-[500px]' : ''}`}>
                    <div className="pl-6 flex flex-col space-y-2">
                      <Link href="/customer-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/customer-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">Customer Master</span>
                        </button>
                      </Link>
                      {/* <Link href="/company-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/company-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">Company Master</span>
                        </button>
                      </Link> */}
                      <Link href="/product-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/product-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">Product Master</span>
                        </button>
                      </Link>
                      <Link href="/user-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/user-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">User Master</span>
                        </button>
                      </Link>
                      <Link href="/location-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/location-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">Location Master</span>
                        </button>
                      </Link>
                      {/* <Link href="/GST-master">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/GST-master" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">GST Master</span>
                        </button>
                      </Link> */}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293A] text-black dark:text-white rounded-xl">
                  <button
                    onClick={() => setIsBillingOpen(!isBillingOpen)}
                    className={`flex items-center gap-3 ps-10 py-4 w-full text-lg rounded-xl 
                    transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                  >
                    <svg className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                      <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z" />
                    </svg>
                    <span className="font-semibold">Billing</span>
                    <div className="flex-grow flex justify-end pe-5">
                      {isBillingOpen ?
                        <svg className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" /></svg> :
                        <svg className="text-black dark:text-white fill-current" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>}
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out mt-2 max-h-0 ${isBillingOpen ? 'max-h-[500px]' : ''}`}>
                    <div className="pl-6 flex flex-col space-y-2">
                          <Link href="/bill-payment">
                            <button
                              onClick={() => setIsSidebarOpen(false)}
                              className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                              ${currentPath === "/bill-payment" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                              transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                            >
                              <span className="font-semibold">Bill Payment</span>
                            </button>
                          </Link>
                      <Link href="/invoice-generation">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 ps-8 py-3 w-full text-lg rounded-xl 
                          ${currentPath === "/invoice-generation" ? 'bg-[#E2E7F1] dark:bg-[#F1F5F9] dark:text-black' : 'bg-white dark:bg-[#1E293A] text-black dark:text-white'} 
                          transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black`}
                        >
                          <span className="font-semibold">Invoice Generation</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              <Link href="/login">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 ps-10 py-4 w-full text-lg rounded-xl text-black dark:text-white bg-white dark:bg-black transition duration-200 ease-in-out hover:bg-[#E2E7F1] dark:hover:bg-[#F1F5F9] dark:hover:text-black"
                >
                  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <g fill="#030d45">
                      <path d="m22 6.62219v10.62281c0 1.1129-.7143 2.2258-1.8367 2.6304l-5.1021 1.9223c-.3061.1011-.6122.2023-1.0204.2023-.5102 0-1.1224-.2023-1.6326-.5058-.2041-.2024-.5102-.4047-.6123-.6071h-3.87753c-1.53061 0-2.85715-1.214-2.85715-2.8327v-1.0117c0-.4047.30613-.8094.81633-.8094.51021 0 .81633.3035.81633.8094v1.0117c0 .7082.61224 1.214 1.22449 1.214h3.36733v-14.56843h-3.36733c-.71429 0-1.22449.50585-1.22449 1.21404v1.01169c0 .40468-.30612.80936-.81633.80936-.5102 0-.81633-.40468-.81633-.80936v-1.01169c0-1.51755 1.2245-2.83276 2.85715-2.83276h3.87753c.2041-.20234.4082-.40468.6123-.60702.8163-.50585 1.7347-.60702 2.653-.30351l5.1021 1.92223c1.0204.30351 1.8367 1.41638 1.8367 2.52924z" />
                      <path d="m4.85714 14.8169c-.20408 0-.40816-.1011-.5102-.2023l-2.04082-2.0234c-.10204-.1012-.10204-.2023-.20408-.2023 0-.1012-.10204-.2024-.10204-.3035 0-.1012 0-.2024.10204-.3035 0-.1012.10204-.2024.20408-.2024l2.04082-2.02338c.30612-.30351.81633-.30351 1.12245 0s.30612.80938 0 1.11288l-.71429.7082h4.18368c.40816 0 .81632.3035.81632.8093 0 .5059-.40816.6071-.81632.6071h-4.28572l.71429.7081c.30612.3035.30612.8094 0 1.1129-.10204.1012-.30613.2023-.51021.2023z" />
                    </g>
                  </svg>
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
