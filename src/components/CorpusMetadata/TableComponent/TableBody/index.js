import { useContext } from "react";
import { TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { Context } from "../../../../App";
import VersionIdCell from "./VersionIdCell";
import BookTitleCell from "./BookTitleCell";
import AuthorCell from "./AuthorCell";
import ReuseCell from "./ReuseCell";
import MoreCell from "./MoreCell";
import CountToken from "./CountToken";

const TableBodyComponent = ({ classes }) => {
  const { rows } = useContext(Context);
  return (
    <TableBody>
      {rows.map((row, index) => (
        <TableRow
          key={index}
          className={classes.tableCell}
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            width: {
              xs: "100%",
              md: "100%",
            },
            padding: {
              xs: "10px 0px",
              md: "0px",
            },
            alignItems: {
              xs: "start",
              md: "center",
            },
            borderWidth: "0px",
            borderColor: "#d1d5db",
            borderStyle: "solid",
            bgcolor:
              row?.release_version?.analysis_priority === "sec"
                ? "#fef3c7"
                : "white",
            borderBottomWidth: "1px",
            "&:last-child": {
              borderBottomWidth: "0px",
            },
          }}
        >
          <VersionIdCell row={row} classes={classes} />

          <BookTitleCell row={row} classes={classes} />

          <AuthorCell row={row} classes={classes} />

          <TableCell
            className={classes.tableCell}
            sx={{
              width: {
                xs: "100%",
                md: "10%",
              },
              border: "none",
              display: "flex",
              justifyContent: {
                xs: "space-between !important",
                md: "center !important",
              },
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            {row?.text.author[0]?.date && row?.text?.author[0]?.date}
            <Typography
              sx={{
                display: {
                  xs: "block",
                  md: "none",
                },
              }}
            >
              Author Death
            </Typography>
          </TableCell>

          <CountToken classes={classes} row={row} />

          <ReuseCell classes={classes} row={row} />

          <MoreCell classes={classes} row={row} />
        </TableRow>
      ))}
    </TableBody>
  );
};

export default TableBodyComponent;
