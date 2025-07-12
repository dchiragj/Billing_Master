"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { PDFViewer } from '@react-pdf/renderer';
import StatementPDF from '../components/StatementPDF';

const Page = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [offset, setOffset] = useState(0);
    const [MRViewData, setMRViewData] = useState([]); // Your actual data should go here
    const itemsPerPage = 10; // Set your desired items per page

    // Calculate paginated data
    const paginatedData = MRViewData.slice(offset, offset + itemsPerPage);
    const displayData = showAll ? MRViewData : paginatedData;

    const tableHeaders = [
        'SrNo.',
        'MR No',
        'Location',
        'Party Name',
        'Oth. Charges',
        'MR Amt.',
        'Pay. Mode',
        'Deduction',
        'Action'
    ];

    const formatRowData = (mr, index) => ({
        'SrNo.': index + 1,
        'MR No': mr.Mrsno || "-",
        'Location': mr.Location ? mr.Location.split(":")[1]?.trim() : "-",
        'Party Name': mr.ptmsstr || "-",
        'Oth. Charges': mr.OtherChrg || "0.00",
        'MR Amt.': mr.MrAmt || "0.00",
        'Pay. Mode': mr.Paymode || "-",
        'Deduction': mr.deduction || "-",
        'Action': (
            <button
                // onClick={() => handlePrintClick(mr)}
                className="font-medium text-blue-600 hover:underline"
                title="Print MR"
            >
                <FontAwesomeIcon icon={faPrint} />
            </button>
        ),
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-hidden">
            <div className="flex justify-between items-center mb-4">
                <h6 className='text-base font-bold'>Report</h6>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        {showAll ? 'Show Paginated' : 'Show All'}
                    </button>
                </div>
            </div>
            <div className="relative shadow-md sm:rounded-lg border max-h-[70vh] flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="text-gray-700 uppercase bg-gray-200 border-b-2 sticky -top-0.5 z-10">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3 border border-gray-300 whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <svg
                                                className="animate-spin h-8 w-8 text-blue-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayData.length > 0 ? (
                                displayData.map((mr, index) => (
                                    <tr
                                        key={index}
                                        className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                                    >
                                        {Object.values(formatRowData(mr, showAll ? index : offset + index)).map((value, i) => (
                                            <td key={i} className="px-6 py-4 border whitespace-nowrap">
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="px-6 py-4 text-center">
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {!showAll && MRViewData.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
                        <button
                            onClick={() => setOffset(Math.max(0, offset - itemsPerPage))}
                            disabled={offset === 0}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>
                            Page {Math.floor(offset / itemsPerPage) + 1} of {Math.ceil(MRViewData.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setOffset(Math.min(MRViewData.length - itemsPerPage, offset + itemsPerPage))}
                            disabled={offset + itemsPerPage >= MRViewData.length}
                            className="px-4 py-2 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
                <PDFViewer style={{ width: '100%', height: '100vh' }}>
                    <StatementPDF />
                </PDFViewer>
            </div>
        </div>
    );
};

export default Page;