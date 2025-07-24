import { TablePagination } from "@mui/material";
import React from "react";
import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Context } from "../../App";
import { cleanSearchPagination } from "../../utility/Helper"

const PaginationComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { totalRecords, rowsPerPage, page } = useContext(Context);

  // change prev and next page from pagination bar
  const handleChangePage = async (newPage) => {
    const params = Object.fromEntries([...searchParams]);
    setSearchParams({ ...params, page: newPage });
  };

  // change rows per page from pagination dropdown
  const handleChangeRowsPerPage = (event) => {
    // remove the page parameter from the query string
    const params = cleanSearchPagination(searchParams);
    setSearchParams({ ...params, rowsPerPage: +event.target.value });
  };

  return (
    <TablePagination
      rowsPerPageOptions={[10, 25, 100]}
      component="div"
      count={totalRecords}
      rowsPerPage={rowsPerPage}
      page={page - 1}
      onPageChange={(e, pageNumber) => handleChangePage(pageNumber + 1)}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default PaginationComponent;
