"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUser, faCodeBranch, faCalendarAlt, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const HeaderItem = ({ icon, label, value, isCompact = false }) => (
  <div className={`flex items-center ${isCompact ? 'w-full' : 'bg-gray-50 p-3 rounded-lg border border-gray-100 w-full'}`}>
    <div className="bg-gray-200 p-2 rounded-lg mr-3">
      <FontAwesomeIcon icon={icon} className="text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      {!isCompact && <p className="text-xs text-gray-500 mb-1">{label}</p>}
      <p className={`${isCompact ? 'text-sm' : 'text-sm'} font-medium text-gray-800 truncate`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

const Header = () => {
  const { userDetail } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const headerItems = [
    { icon: faBuilding, label: "Company", value: userDetail?.CompanyName },
    { icon: faUser, label: "Employee", value: userDetail?.UserName },
    { icon: faCodeBranch, label: "Branch", value: userDetail?.LocationName },
    { icon: faCalendarAlt, label: "Financial Year", value: userDetail?.FinancialYear }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 lg:left-[288px] pb-3 md:pb-0 bg-white border-b border-gray-200 ${isExpanded ? "shadow-2xl" : "shadow-md" } z-30`}>
      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mx-3 mt-3">
          <HeaderItem 
            icon={headerItems[0].icon}
            value={headerItems[0].value}
            isCompact
          />
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 ml-3 transition-transform duration-200"
          >
            <FontAwesomeIcon 
              icon={isExpanded ? faChevronUp : faChevronDown} 
              className="transition-all duration-200"
            />
          </button>
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="space-y-3 px-3 py-2">
            {headerItems.slice(1).map((item, index) => (
              <HeaderItem key={`mobile-${index}`} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 p-4">
        {headerItems.map((item, index) => (
          <HeaderItem key={`desktop-${index}`} {...item} />
        ))}
      </div>
    </header>
  );
};

export default Header;