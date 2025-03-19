"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { getCompanyData } from '@/lib/masterService';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CompanyMaster = () => {
  const [companyData, setCompanyData] = useState([]);
  const { setIsSidebarOpen } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

    async function fetchData() {
        try {
          const response = await getCompanyData();
            setCompanyData(response);
        } catch (error) {
          console.log(error.response.data.message);
        }
      }

  const tableHeaders = ['Company Code', 'Company Name', 'Contact Person', 'Address', 'PAN No', 'Punch Line', 'Entry By', 'Registration No','Service Tax No', 'Action'];


  const filteredData = companyData.map((company) => ({
    'Company Code': company.CompanyCode || "-",
    'Company Name': company.CompanyName || "-",
    'Contact Person': company.ContactPerson || "-",
    'Address': company.Address || "-",
    'PAN No': company.PANNo || "-",
    'Punch Line': company.PunchLine || "-",
    'Registration No': company.RegistrationNo || "-",
    'Service Tax No': company.ServicetaxNo || "-",
    Action: (
      <button
        onClick={() => handleEditClick(company)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        Edit
      </button>
    ),
  }));

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ">
      <button
        className="lg:hidden text-black p-3 flex justify-start"
        onClick={() => setIsSidebarOpen(true)}
      >
       <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Company Master</h4>
          <button className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center">
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        
        <Table headers={tableHeaders} data={filteredData} />
      </div>
    </div>
  );
};

export default CompanyMaster;
