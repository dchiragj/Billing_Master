"use client"
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faAngleDown, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { fetchDropdownData } from '@/lib/masterService';


const SettingsPage = () => {
  const { setIsSidebarOpen, setUserDetail, userDetail } = useAuth();
  const [formData, setFormData] = useState({
    financialYear: userDetail?.FinancialYear || '',
    companyCode: userDetail?.CompanyCode || '',
    companyName: userDetail?.CompanyName || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    Company: [],
    FinYear: []
  });

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

  const handleDropdownData = async (CompanyCode, MstCode) => {
    try {
      if (CompanyCode) {
        const data = await fetchDropdownData(CompanyCode, MstCode);
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      }
    } catch (error) {
      console.log(`Error fetching ${MstCode}:`, error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'companyCode') {
      const selectedCompany = dropdownData.Company.find(c => c.CompanyCode.toString() === value);
      if (selectedCompany) {
        setFormData(prev => ({
          ...prev,
          companyCode: selectedCompany.CompanyCode,
          companyName: selectedCompany.CompanyName,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const updatedUserDetails = {
      ...userDetail,
      FinancialYear: formData.financialYear,
      CompanyCode: formData.companyCode,
      CompanyName: formData.companyName
    };
  
    setUserDetail(updatedUserDetails);
    localStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
  
    toast.success('Settings updated successfully!');
    setIsSubmitting(false);
  };

  return (
    <div className="h-full">
            <button
        className="lg:hidden text-xl text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </button>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-xl font-bold text-center mb-6">Settings</h4>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="space-y-6">
            {/* Financial Year Dropdown */}
            <div className="bg-white text-black rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Financial Year
              </label>
              <div className="relative">
                <select
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {dropdownData.FinYear.map(year => (
                    <option key={year.FinYear} value={year.FinYear}>{year.FinYear}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FontAwesomeIcon icon={faAngleDown} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Company Selection Dropdown */}
            <div className="bg-white text-black rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Selection
              </label>
              <div className="relative">
                <select
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {dropdownData.Company.map(company => (
                    <option key={company.CompanyCode} value={company.CompanyCode}>
                      {company.CompanyName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FontAwesomeIcon icon={faAngleDown} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 w-full md:w-auto justify-center text-base rounded-xl bg-blue-600 text-white transition duration-200 ease-in-out hover:bg-blue-700 ${isSubmitting ? 'opacity-75' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    <span>Update Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;