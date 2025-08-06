import { Paper, Table, TableContainer } from "@mui/material";
import TableHeader from "./TableHeader";
import TableBodyComponent from "./TableBody";

// format colum data
const columns = [
  { field: "book_id", headerName: "Version ID", minWidth: 200 },
  { field: "title_lat", headerName: "Book Title", minWidth: 100 },
  { field: "author_lat", headerName: "Author", minWidth: 100 },
  { field: "date", headerName: "Author Death Date", minWidth: 100 },
  {
    field: "tok_length",
    headerName: "Token Count",
    minWidth: 100,
    type: "number",
  },
  { field: "text_reuse", headerName: "Text Reuse", minWidth: 100 },
  { field: "", headerName: "More", minWidth: 100 },
];

const TableComponent = ({ classes }) => {
  return (
    <TableContainer component={Paper} dir="rtl">
      <Table
        sx={{ display: "flex", flexDirection: "column" }}
        size="small"
        stickyHeader
      >
        <TableHeader columns={columns} classes={classes} />
        <TableBodyComponent classes={classes} />
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
