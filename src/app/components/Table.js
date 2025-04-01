// import { useState } from "react";
// import ReactPaginate from "react-paginate";

// const Table = ({ headers, data = [], loading = false }) => {
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 10; 

//   const tableData = Array.isArray(data) ? data : [];

//   const pageCount = Math.ceil(tableData.length / itemsPerPage);

//   const startIndex = currentPage * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentData = tableData.slice(startIndex, endIndex);

//   const handlePageClick = ({ selected }) => {
//     setCurrentPage(selected);
//   };
//     return (
//       <div>
//       <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
//         <table className="min-w-full text-sm text-left rtl:text-right text-gray-500">
//           <thead className="text-gray-700 uppercase bg-gray-200 border-b-2">
//             <tr>
//               {headers.map((header, index) => (
//                 <th key={index} className="px-6 py-3 sm:px-4 border border-gray-300">
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {currentData.length > 0 ? (
//               currentData.map((rowData, index) => (
//                 <tr
//                   key={index}
//                   className="odd:bg-white even:bg-gray-50  border-b border-gray-200"
//                 >
//                   {headers.map((header, headerIndex) => (
//                     <td key={headerIndex} className="px-6 py-4 border">
//                       {rowData[header] || "-"}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={headers.length} className="px-6 py-4 text-center">
//                   No Data Available
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//        {/* Pagination */}
//        <ReactPaginate
//         previousLabel={"Previous"}
//         nextLabel={"Next"}
//         breakLabel={"..."}
//         pageCount={pageCount}
//         marginPagesDisplayed={2}
//         pageRangeDisplayed={5}
//         onPageChange={handlePageClick}
//         containerClassName={"flex justify-center items-center mt-4 space-x-2"}
//         pageClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//         pageLinkClassName={"text-gray-700"}
//         activeClassName={"bg-blue-500 text-white"}
//         activeLinkClassName={"text-white"}
//         previousClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//         nextClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
//         disabledClassName={"opacity-50 cursor-not-allowed"}
//       />
//       </div>
//     );
//   };
  
//   export default Table;
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

const Table = ({ headers, data = [], loading = false, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Ensure data is always an array
  const tableData = Array.isArray(data) ? data : [];

  // Calculate pagination values
  const pageCount = Math.ceil(tableData.length / itemsPerPage);

  useEffect(() => {
    // If current page is beyond the new page count, go to last page
    if (pageCount > 0 && currentPage >= pageCount) {
      setCurrentPage(pageCount - 1);
    }
  }, [pageCount, currentPage]);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div>
      {/* Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
        <table className="min-w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-gray-700 uppercase bg-gray-200 border-b-2">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 sm:px-4 border border-gray-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading state
              <tr>
                <td colSpan={headers.length} className="px-6 py-4 text-center">
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
            ) : currentData.length > 0 ? (
              // Render table rows
              currentData.map((rowData, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  {headers.map((header, headerIndex) => (
                    <td key={headerIndex} className="px-6 py-4 border">
                      {rowData[header] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Empty state
              <tr>
                <td colSpan={headers.length} className="px-6 py-4 text-center">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={pageCount}
          forcePage={currentPage} 
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"flex justify-center items-center mt-4 space-x-2"}
          pageClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
          pageLinkClassName={"text-gray-700"}
          activeClassName={"bg-blue-500 text-white"}
          activeLinkClassName={"text-white"}
          previousClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
          nextClassName={"px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-200"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
        />
      )}
    </div>
  );
};

export default Table;