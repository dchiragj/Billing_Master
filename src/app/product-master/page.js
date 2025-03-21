
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { addItem, fetchDropdownData, Finyear, getItemLocation, getItemPrice, getItemTax, getProductData } from '@/lib/masterService';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';

const ProductMaster = () => {
  const [productData, setProductData] = useState({});
  const { setIsSidebarOpen, userDetail } = useAuth();
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    IMst: [{
      IName: "",
      IGroup: "",
      LocationId: 0,
      IDesc: "",
      TentativeDate: new Date().toISOString().split('T')[0] + "T00:00:00",
      HSNCode: "",
      Category: "",
      VendorCode: "",
      Size: "",
      Weight: "",
      Status: "",
      Price: 0,
      Unit: "",
      MinStock: 0,
      IsMinStockAlert: 1,
      Doc_Path: "",
      SDesc: "",
      PDesc: "",
      Finyear: Finyear,
      CompanyCode: userDetail.CompanyCode,
      Installation: 0,
      IsActive: 1,
      EntryBy: userDetail.UserId,

    }],
    ITaxDetail: {
      Taxdata: []
    },
    IPriceDetail: {
      PriceData: []
    },
    rackDetails: {
      LocData: []
    },
    IImageData: {
      Images: [
        {
          ImageName: "",
          ImageFile: null
        }
      ]
    },
    Finyear: Finyear,
    CompanyCode: userDetail.CompanyCode
  });
  const [imageToShow, setImageToShow] = useState(null);
  const [dropdownData, setDropdownData] = useState({
    IUnit: [],
    IStatus: [],
    Location: [],
    IGroup: [],
    ICat: [],
  });

  useEffect(() => {
    if (userDetail?.CompanyCode) {
      fetchData();
      Object.keys(dropdownData).forEach((key) => {
        handleDropdownData(userDetail.CompanyCode, key);
      });
    }
  }, [userDetail?.CompanyCode]);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getProductData(userDetail.CompanyCode);
      setProductData(data);
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDropdownData = async (CompanyCode, MstCode) => {
    try {
      if (userDetail.CompanyCode) {
        const data = await fetchDropdownData(CompanyCode, MstCode);
        setDropdownData((prev) => ({
          ...prev,
          [MstCode]: data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${MstCode}:`, error);
    }
  };

  const handleInputChange = (e, section = "IMst", index = 0) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev };
      if (section === "IMst") {
        newData.IMst[0][name] = updatedValue;
      } else if (section === "ITaxDetail") {
        newData.ITaxDetail.Taxdata[index][name] = updatedValue;
      } else if (section === "rackDetails") {
        newData.rackDetails.LocData[index][name] = updatedValue;
      } else if (section === "IPriceDetail") {
        newData.IPriceDetail.PriceData[index][name] = updatedValue;
      } else if (section === "IImageData") {
        newData.IImageData.Images[index][name] = updatedValue;
      }
      return newData;
    });
  };

  const tableHeadersItemDetails = ['Product Name', 'Description', 'Category', 'Product Code', 'Price', 'Weight', 'Action'];
  const filteredDataItemDetails = Object.keys(productData).length > 0 && productData.itemDetails.map((itemDetail) => ({
    'Product Name': itemDetail.IName || "-",
    'Description': itemDetail.IDesc || "-",
    'Category': itemDetail.Category || "-",
    'Product Code': itemDetail.ICode || "-",
    'Price': itemDetail.Price || "-",
    'Weight': itemDetail.Weight || "-",
    Action: (
      <button
        onClick={() => handleEditClick(itemDetail)}
        className="text-blue-60 font-medium hover:underline"
      >
       <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
      </button>
    ),
  }));

  const handleEditClick = async (product) => {
    setIsEdit(true);
    setLoading(true);

    try {
      const data = await getProductData(userDetail.CompanyCode, product.ICode);
      setImageToShow(data.itemDetails[0].Doc_Path);
      setFormData({
        IMst: data.itemDetails,
        ITaxDetail: { Taxdata: data.taxData },
        rackDetails: { LocData: data.rackDetails },
        IPriceDetail: { PriceData: data.priceData },
        IImageData: {
          Images: data.itemImages.map(image => ({
            ImageName: image.ImageName,
            ImageFile: image.ImageFile
          }))
        },
        Finyear: Finyear,
        CompanyCode: userDetail.CompanyCode,
        ICode: data.itemDetails[0].ICode
      });
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleAddClick = async () => {
    setIsEdit(false);
    setImageToShow(null)
    const productLocationData = await getItemLocation(userDetail.CompanyCode);
    const productPriceData = await getItemPrice(userDetail.CompanyCode);
    const productTaxData = await getItemTax(userDetail.CompanyCode);

    setFormData({
      IMst: [{
        IName: "",
        IGroup: "",
        LocationId: "",
        IDesc: "",
        TentativeDate: new Date().toISOString().split('T')[0] + "T00:00:00",
        HSNCode: "",
        Category: "",
        VendorCode: "",
        Size: "",
        Weight: "",
        Status: "",
        Price: 0,
        Unit: "",
        MinStock: 0,
        IsMinStockAlert: 0,
        Doc_Path: "",
        SDesc: "",
        PDesc: "",
        Finyear: Finyear,
        CompanyCode: userDetail.CompanyCode,
        Installation: 0,
        IsActive: 1,
        EntryBy: userDetail.UserId
      }],
      ITaxDetail: {
        Taxdata: productTaxData
      },
      IPriceDetail: {
        PriceData: productPriceData
      },
      rackDetails: {
        LocData: productLocationData
      },
      IImageData: {
        Images: [
          {
            ImageName: "",
            ImageFile: null
          }
        ]
      },
      Finyear: Finyear,
      CompanyCode: userDetail.CompanyCode
    });

    setModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData || Object.keys(formData).length === 0) {
      toast.error("Please fill in the required fields.");
      return;
    }
      const payload = { ...formData };
    const formDataPayload = new FormData();
    
    if (selectedFile) {
      if (payload.IMst && Array.isArray(payload.IMst)) {
        payload.IMst[0].Doc_Path = selectedFile;
      } else {
        payload.IMst = [{ Doc_Path: selectedFile }];
      }
    }
    if (selectedFile) {
      formDataPayload.append("file", selectedFile);
    }
  
    formDataPayload.append("IMst", JSON.stringify(payload.IMst));
    formDataPayload.append("ITaxDetail", JSON.stringify(payload.ITaxDetail));
    formDataPayload.append("IPriceDetail", JSON.stringify(payload.IPriceDetail));
    formDataPayload.append("LocData", JSON.stringify(payload.rackDetails));
    formDataPayload.append("IImageData", JSON.stringify(payload.IImageData));
    formDataPayload.append("Finyear", payload.Finyear);
    formDataPayload.append("CompanyCode", payload.CompanyCode);
    if(payload.IMst[0].ICode){
      formDataPayload.append("ICode", payload.IMst[0].ICode);
    }
  
    try {
      // Send the FormData payload to the backend
      const response = await addItem(formDataPayload);
  
      // const result = await response.json();
  
      if (response.status) {
        toast.success(response.message || "Item added successfully!");
        fetchData(); // Refresh data
        setModalOpen(false); // Close modal
        setFormData({}); // Reset form data
        setSelectedFile(null); // Clear the selected file
        setImageToShow(null)
      } else {
        toast.error(response.message || "Failed to add item.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };
  
  return (
    <div className={`p-8 w-full lg:w-[calc(100vw-288px)] ml-0 lg:ml-[288px] text-black min-h-screen ${modalOpen ? "overflow-hidden h-screen" : "overflow-auto"}`}>
      <button
        className="flex justify-start p-3 text-black lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
       <FontAwesomeIcon icon={faAlignLeft} />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold">Product Master</h4>
          <button
            onClick={handleAddClick}
            className="flex bg-blue-700 rounded-md text-white hover:bg-blue-800 hover:ring items-center px-5 py-1"
          >
            <span className="text-2xl">+ </span> ADD
          </button>
        </div>
        {loading ? (
          <div className="flex h-[70vh] justify-center items-center">
            <div className="border-4 border-blue-500 border-t-transparent h-16 rounded-full w-16 animate-spin"></div>
          </div>
        ) : (
          <Table headers={tableHeadersItemDetails} data={filteredDataItemDetails} />
        )}
      </div>
      {modalOpen && (
        <div className="flex bg-gray-500 bg-opacity-50 justify-center fixed inset-0 items-center lg:ml-[288px] ml-0 px-5 z-50">
          <div className="bg-white border-2 border-gray-300 p-8 rounded-lg shadow-lg w-full max-h-[90vh] max-w-6xl overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl">{isEdit ? "Edit Product Master" : "Add Product Master"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-red-500 text-xl font-bold">X</button>
            </div>
            <form onSubmit={handleAddSubmit} className="bg-white border-2 p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  ["IName", "Item Name", "text", true],
                  ["IGroup", "Item Group", "select", true,dropdownData.IGroup],
                  ["LocationId", "Location ID", "select", true, dropdownData.Location],
                  ["IDesc", "Item Description", "textarea", true],
                  ["TentativeDate", "Tentative Date", "date", false],
                  ["HSNCode", "HSN Code", "text", true],
                  ["Category", "Category", "select", true,dropdownData.ICat],
                  // ["VendorCode", "Vendor Code", "text", true],
                  ["Size", "Size", "text", true],
                  ["Weight", "Weight", "number", true],
                  ["Status", "Status", "select", true, dropdownData.IStatus],
                  ["Price", "Price", "number", true],
                  ["Unit", "Unit", "select", true, dropdownData.IUnit],
                  ["MinStock", "Minimum Stock", "number", true],
                  ["IsMinStockAlert", "Minimum Stock Alert", "checkbox", false],
                  // ["Doc_Path", "Document Path", "file", false],
                  ["SDesc", "Short Description", "textarea", false],
                  ["PDesc", "Product Description", "textarea", false],
                  ["Installation", "Installation", "number", false],
                  ["IsActive", "Is Active", "checkbox", false],
                ].map(([name, label, type, isRequired, options], index) => (
                  <div key={index} className={`flex items-center ${type === "textarea" ? "md:col-span-2" : ""}`}>
                    <label className={`text-gray-700 font-medium ${label === "Address" ? "lg:w-1/6" : ""} w-1/3 text-left`}>{label}</label>
                    {type === "select" ? (
                      <select
                        name={name}
                        value={formData.IMst[0][name] || ""}
                        onChange={(e) => handleInputChange(e)}
                        className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required={isRequired}
                      >
                        <option value="">Select {label}</option>
                        {options.map((option, idx) => (
                          <option key={idx} value={name === "LocationId" ? option.LocationCode : name ===  "IGroup" ? option.IGCode : option.DocCode}>
                            {name === "LocationId" ? option.LocationName :  name ===  "IGroup" ? option.IGName : option.CodeDesc }
                          </option>
                        ))}
                      </select>
                    ) : type === "textarea" ? (
                      <textarea
                        name={name}
                        value={formData.IMst[0][name] || ""}
                        onChange={(e) => handleInputChange(e)}
                        className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 lg:w-5/6 resize-none"
                        rows="2"
                        required={isRequired}
                      />
                    ) : type === "checkbox" ? (
                      <input
                        type={type}
                        name={name}
                        checked={formData.IMst[0][name] || false}
                        onChange={(e) => handleInputChange(e)}
                        className="border-gray-300 h-5 rounded text-blue-600 w-5 focus:ring-gray-500"
                      />
                    ) : 
                     (
                      <input
                        type={type}
                        name={name}
                        value={type === "date" ? (formData.IMst[0][name] ? moment(formData.IMst[0][name]).format("YYYY-MM-DD") : "") : formData.IMst[0][name] || ""} // Replace null with empty string
                        onChange={(e) => type === "file" ? setSelectedFile(e.target.files[0]) : handleInputChange(e)}
                        className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required={isRequired}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Location Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Location Details</h6>
              <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
                <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                  <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700  uppercase">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">Location</th>
                      <th className="border border-gray-300 px-4 py-2">Rack</th>
                      <th className="border border-gray-300 px-4 py-2">MOQ_QTY</th>
                      <th className="border border-gray-300 px-4 py-2">OQ_QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.rackDetails.LocData.map((loc, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{loc.LocationCode}</td>
                        <td className="border border-gray-300 text-end py-2">
                          <input
                            name="Rack"
                            value={loc.Rack || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 mx-1"
                          />
                        </td>
                        <td className="border border-gray-300 text-end py-2">
                          <input
                            type='number'
                            name="Moq_Qty"
                            value={loc.Moq_Qty || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 mx-1"
                          />
                        </td>
                        <td className="border border-gray-300 text-end py-2">
                          <input
                            type='number'
                            name="Oq_Qty"
                            value={loc.Oq_Qty || ""}
                            onChange={(e) => handleInputChange(e, "rackDetails", index)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500 mx-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Price Details</h6>
              <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
                <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                  <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700  uppercase">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No.</th>
                      <th className="border border-gray-300 px-4 py-2">Price Type</th>
                      <th className="border border-gray-300 px-4 py-2"><p>Price</p><p>Discount</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.IPriceDetail.PriceData.map((price, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300">
                          {`${price.DocCode}: ${price.CodeDesc}`}
                        </td>
                        <td className="border border-gray-300 text-end py-2 space-y-1">
                          {/* <input
                            type='number'
                            name="Price"
                            value={price.Price || "0"}
                            onChange={(e) => handleInputChange(e, "IPriceDetail", index)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                          <input
                            type='number'
                            name="Discount"
                            value={price.Discount || "0"}
                            onChange={(e) => handleInputChange(e, "IPriceDetail", index)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          /> */}
                             {price.chgcode?.split("*/").map((item) => {
                            const parts = item.split("~");
                            const key = parts[0];
                            const label = parts[1];
                            const showInput = parts[2] === "Y";

                            return showInput && (
                              <div key={key} className='grid grid-cols-2'>
                                <input
                                  type='number'
                                  name={key}
                                  value={price[key] || "0"}
                                  onChange={(e) => handleInputChange(e, "IPriceDetail", index)}
                                  className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                                <span className="w-1/3 ps-2">{label}</span>
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>Tax Details</h6>
              <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
                <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                  <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700  uppercase">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No.</th>
                      <th className="border border-gray-300 px-4 py-2">Tax Type</th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.ITaxDetail.Taxdata.map((tax, index) => (
                      <tr key={index} className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {`${tax.DocCode}: ${tax.CodeDesc}`}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">

                          {tax.chgcode?.split("*/").map((item) => {
                            const parts = item.split("~");
                            const key = parts[0];
                            const label = parts[1];
                            const showInput = parts[2] === "Y";

                            return showInput && (
                              <div key={key} className='grid grid-cols-2'>
                                <input
                                  type='number'
                                  name={key}
                                  value={tax[key] || "0"}
                                  onChange={(e) => handleInputChange(e, "ITaxDetail", index)}
                                  className="bg-gray-100 border border-gray-300 p-1 rounded-md text-end focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                                <span className="w-1/3 ps-2">{label}</span>
                              </div>
                            );
                          })}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Image Details Table */}
              <h6 className='flex justify-center text-xl font-bold'>File Upload</h6>
              <div className="border shadow-md overflow-x-auto relative sm:rounded-lg">
                <table className="border border-gray-300 text-center text-gray-500 text-sm min-w-full rtl:text-right">
                  <thead className="bg-gray-200 border-b-2 border-gray-400 text-gray-700  uppercase">
                    <tr className="border border-gray-300">
                      <th className="border border-gray-300 px-4 py-2">SR No</th>
                      <th className="border border-gray-300 px-4 py-2">File Upload</th>
                      <th className="border border-gray-300 px-4 py-2">Image</th>
                    </tr>
                  </thead>


                  <tbody>
                    {(!formData.IImageData.Images || formData.IImageData.Images.length === 0) && (
                      <tr className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">1</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="file"
                            name="ImageFile"
                            onChange={(e) => handleInputChange(e, "IImageData", 0)}
                            className="bg-gray-100 border border-gray-300 p-1 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span>No image uploaded</span>
                        </td>
                      </tr>
                    )}

                      <tr  className="border border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{1}</td>
                        <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="file"
                          name="Doc_path"
                          onChange={(e) => {setSelectedFile(e.target.files[0]);
                            setImageToShow(URL.createObjectURL(e.target.files[0]))
                          }}
                          className="bg-gray-100 border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          accept='image/*'
                        />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {imageToShow ? (
                            <img
                              src={imageToShow}
                              alt="Uploaded Image"
                              className="h-20 w-20 object-cover"
                            />
                          ) : (
                            <span>No image uploaded</span>
                          )}
                        </td>
                        {/* <td className="border border-gray-300 px-4 py-2">
                          {formData.IImageData.Images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  IImageData: {
                                    Images: prev.IImageData.Images.filter((_, i) => i !== index),
                                  },
                                }));
                                if (fileInputRefs.current[index]) {    
                                  fileInputRefs.current[index].value = null;
                                }
                                toast.success("Image removed successfully!");
                              }}
                              className="bg-red-600 rounded-md text-white hover:bg-red-700 px-3 py-1"
                            >
                              Remove
                            </button>
                          )}
                        </td> */}
                      </tr>
                    {/* ))} */}

                    {/* <tr>
                      <td colSpan={4} className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              IImageData: {
                                Images: [
                                  ...(prev.IImageData.Images || []),
                                  { ImageName: "", ImageFile: null },
                                ],
                              },
                            }));
                             toast.success("New image row added successfully!");
                          }}
                          className="bg-blue-600 rounded-md text-white hover:bg-blue-700 px-4 py-2"
                        >
                          + Add New
                        </button>
                      </td>
                    </tr> */}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-500 rounded-lg text-white duration-200 hover:bg-gray-600 px-6 py-2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 rounded-lg text-white duration-200 hover:bg-blue-700 px-6 py-2 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaster;

