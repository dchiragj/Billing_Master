"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { getProductData } from '@/lib/masterService';

const ProductMaster = () => {
  const [productData, setProductData] = useState({});
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
    }
  }, [userDetail.CompanyCode]);



  async function fetchData() {
    setLoading(true)
    try {
      const data = await getProductData(userDetail.CompanyCode);
      setProductData(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {``
      setLoading(false)
    }
  }

  const tableHeadersIMst = ['Product Name', 'Description', 'Category', 'ICode', 'Price', 'Weight', 'Action'];
  const filteredDataIMst =
  {
    'Product Name': productData?.itemDetails?.IName || "-",
    'Description': productData?.itemDetails?.IDesc || "-",
    'Category': productData?.itemDetails?.Category || "-",
    'Product Code': productData?.itemDetails?.ICode || "-",
    'Price': productData?.itemDetails?.Price || "-",
    'Weight': productData?.itemDetails?.Weight || "-",
    Action: (
      <button
        onClick={() => handleEditClick(productData?.itemDetails)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        Edit
      </button>
    ),
  }
  const tableHeadersITaxDetail = ['Code', 'SCHG01', 'SCHG03', 'SCHG03', 'SCHG04', 'SCHG05', 'SCHG06', 'SCHG07', 'SCHG08', 'SCHG09', 'SCHG010'];
  const filteredDataITaxDetail = productData?.taxData?.length > 0 && productData?.taxData?.map((product) => ({
    "Code": product.DocCode || "-",
    "SCHG01": product.SCHG01 || "-",
    "SCHG02": product.SCHG02 || "-",
    "SCHG03": product.SCHG03 || "-",
    "SCHG04": product.SCHG04 || "-",
    "SCHG05": product.SCHG05 || "-",
    "SCHG06": product.SCHG06 || "-",
    "SCHG07": product.SCHG07 || "-",
    "SCHG08": product.SCHG08 || "-",
    "SCHG09": product.SCHG09 || "-",
    "SCHG010": product.SCHG10 || "-",
  }));

  const tableHeadersILocDetail = ['Location Name', 'Moq Qty', 'Oq Qty', 'Rack'];
  const filteredDataILocDetail = productData?.rackDetails?.length > 0 && productData?.rackDetails?.map((product) => ({
    "Location Name": product.LocationName || "-",
    "Moq Qty": product.Moq_Qty || "-",
    "Oq Qty": product.Oq_Qty || "-",
    "Rack": product.Rack || "-",
  }))

  const tableHeadersIPriceDetail = ['SR No.', 'Price Type', 'Price'];
  const filteredDataIPriceDetail = productData?.priceData?.length > 0 && productData?.priceData?.map((product,index) => ({
  "SR No": index + 1,
  "Price Type": product.PriceType,
  "Price" : product.Price
  }))


  const handleEditClick = (product) => {
    console.log("Edit Product:", product);
  };

  const handleAddClick = () => {
    console.log("Add New Product");
  };

  return (
    <div className="p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen">
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
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Product Master</h4>
          <button
            onClick={handleAddClick}
            className="bg-blue-700 hover:bg-blue-800 hover:ring text-white rounded-md px-5 py-1 flex items-center"
          >
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        {loading ?
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          :
          <>
            <Table headers={tableHeadersIMst} data={[filteredDataIMst]} />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
            <div>
              <h5 className='flex justify-center text-lg font-semibold pb-2'>Location Details</h5>
              <Table headers={tableHeadersILocDetail} data={filteredDataILocDetail} />
            </div>
            <div >
              <h5 className='flex justify-center text-lg font-semibold pb-2'>Price Details</h5>
              <Table headers={tableHeadersIPriceDetail} data={filteredDataIPriceDetail} />
            </div>
            </div>
            <div>
              <h5 className='flex justify-center text-lg font-semibold pb-2'>Tax Details</h5>
              <Table headers={tableHeadersITaxDetail} data={filteredDataITaxDetail} />
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default ProductMaster;
