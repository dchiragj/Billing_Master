import { useState } from "react";
import ReactPaginate from "react-paginate";

const Table = ({ headers, data = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; 

  const tableData = Array.isArray(data) ? data : [];

  const pageCount = Math.ceil(tableData.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
    return (
      <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
        <table className="min-w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-gray-700 uppercase bg-gray-200 border-b-2">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 sm:px-4 border border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((rowData, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50  border-b border-gray-200"
                >
                  {headers.map((header, headerIndex) => (
                    <td key={headerIndex} className="px-6 py-4 border">
                      {rowData[header] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
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
       <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={pageCount}
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
      </div>
    );
  };
  
  export default Table;
  