import { useContext } from "react";
import { Paper, Table, TableContainer } from "@mui/material";
import TableHeader from "./TableHeader";
import TableBodyComponent from "./TableBody";
import { Context } from "../../../App";

const TableComponent = ({ classes }) => {
  const { activeSubcorpora } = useContext(Context);
  const includeManuscripts = activeSubcorpora.includes("MSS");

  // column names for the two multifunctional columns change when manuscripts
  // are included, to reflect that they may contain shelfmarks/holdings
  // instead of book titles/author names
  const columns = [
    { field: "book_id", headerName: "Version ID", minWidth: 200 },
    {
      field: "title_lat",
      headerName: includeManuscripts ? "Book Title / Shelfmark" : "Book Title",
      minWidth: 100,
    },
    {
      field: "author_lat",
      headerName: includeManuscripts ? "Author / Holding" : "Author",
      minWidth: 100,
    },
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
