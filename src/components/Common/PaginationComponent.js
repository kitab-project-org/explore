import { TablePagination } from "@mui/material";
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

  /**
   * the TablePagination component consists of nested sub-components 
   * with the following classes:
   * - .MuiTablePagination-toolbar
   *   - .MuiTablePagination-selectLabel: "Rows per page: "
   *   - .MuiInputBase-root: dropdown for the number of rows per page
   *   - .MuiTablePagination-displayedRows : "1-10 of 8711"
   *   - .MuiTablePagination-actions: < and > buttons
   *     - .MuiButtonBase-root: < and > buttons both have this class
   */

  return (
    <TablePagination
      rowsPerPageOptions={[10, 25, 100]}
      component="div"
      count={totalRecords}
      rowsPerPage={rowsPerPage}
      page={page - 1}
      onPageChange={(e, pageNumber) => handleChangePage(pageNumber + 1)}
      onRowsPerPageChange={handleChangeRowsPerPage}
      sx={{
        // Avoid creating an overflow scroll bar on smaller screens:
        overflowX: "auto",
        // reduce space between subcomponents
        "& .MuiTablePagination-toolbar": {
          gap: 0.5,          // gap between sub-components
          pl: "12px"          // padding left
        },
        // reduce margins and padding of subcomponents
        "& .MuiInputBase-root": {
          mr: "8px !important",  // margin right
          ml: "4px !important",  // margin left
        },
        "& .MuiTablePagination-actions": {
          ml: "8px"    // margin left
        },
        "& .MuiButtonBase-root": {
          p: "2px"     // padding
        }
      }}
    />
  );
};

export default PaginationComponent;
