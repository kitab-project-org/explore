import { useContext } from "react";
import { Box, Checkbox, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import SortingComponent from "./SortingButtons/SortingComponent";
import { Context } from "../../../../App";

const TableHeader = ({ columns, classes }) => {
  const { rows, checkedBooks, setCheckedBooks } = useContext(Context);

  const allChecked = rows?.length > 0 && rows.every(r => checkedBooks.some(c => c.id === r.id));
  const someChecked = !allChecked && rows?.some(r => checkedBooks.some(c => c.id === r.id));

  const handleSelectAll = () => {
    if (allChecked) {
      setCheckedBooks(checkedBooks.filter(c => !rows.some(r => r.id === c.id)));
    } else {
      const newRows = rows.filter(r => !checkedBooks.some(c => c.id === r.id));
      setCheckedBooks([...checkedBooks, ...newRows]);
    }
  };
  // get table cell width; the two multifunctional columns keep the same width
  // regardless of whether manuscripts are included
  const getWidth = (value) => {
    if (value === "More") {
      return "1%";
    } else if (value === "Text Reuse") {
      return "10%";
    } else if (value === "Token Count") {
      return "9%";
    } else if (value === "Author Death Date") {
      return "10%";
    } else if (value === "Author" || value === "Author / Holding") {
      return "22%";
    } else if (value === "Book Title" || value === "Book Title / Shelfmark") {
      return "35%";
    } else if (value === "Version ID") {
      return "19%";
    } else {
      return "auto";
    }
  };

  // return sorting button components; the two multifunctional columns sort by
  // text fields when manuscripts are included — manuscript rows without those
  // fields will naturally sort to the end
  const returnComponent = (column) => {
    if (column === "Author Death Date ") {
      return (
        <SortingComponent
          ascending={"version__text__author__date"}
          descending={"-version__text__author__date"}
        />
      );
    } else if (column === "Token Count") {
      return (
        <SortingComponent ascending={"tok_length"} descending={"-tok_length"} />
      );
    /*} else if (column === "Book Title" || column === "Book Title / Shelfmark") {
      return (
        <SortingComponent
          ascending={"version__text__title_lat_prefered"}
          descending={"-version__text__title_lat_prefered"}
        />
      );
    } else if (column === "Author" || column === "Author / Holding") {
      return (
        <SortingComponent
          ascending={"version__text__author__author_lat_prefered"}
          descending={"-version__text__author__author_lat_prefered"}
        />
      );*/
    } else if (column === "Text Reuse") {
      return (
        <SortingComponent
          ascending={"versionwise_reuse__n_instances"}
          descending={"-versionwise_reuse__n_instances"}
        />
      );
    }
  };

  const getAlign = (value) => {
    if (value === "More") {
      return "flex-end";
    } else if (value === "Text Reuse") {
      return "flex-end";
    } else if (value === "Author Death Date") {
      return "center";
    } else if (value === "Token Count") {
      return "center";
    } else {
      return "flex-start";
    }
  };

  return (
    <TableHead
      sx={{
        color: "text.primary",
        fontSize: 34,
        fontWeight: "medium",
        display: {
          xs: "none",
          sm: "block",
        },
        flexDirection: {
          xs: "column",
          sm: "row",
        },
      }}
    >
      <TableRow
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "start",
        }}
      >
        {columns.map((column) => (
          <TableCell
            className={classes.tableHeaderCell}
            id={column.field.replace("_", "-")+"-header"}
            key={column.field}
            sx={{
              width: `${getWidth(column.headerName)} !important`,
              display: {
                xs: column.headerName === "Author Death Date" ? "none" : "flex",
                sm: "flex",
              },
              alignItems: "center",
              justifyContent: {
                xl: `${getAlign(column.headerName)} !important`,
                md: "center !important",
              },
            }}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              lineHeight={"18px"}
              textAlign="center"
            >
              {column.headerName === "More" ? (
                <Tooltip title="Select / deselect all on this page">
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={handleSelectAll}
                    sx={{ color: "white", "&.Mui-checked": { color: "white" }, "&.MuiCheckbox-indeterminate": { color: "white" }, p: 0 }}
                  />
                </Tooltip>
              ) : (
                <>
                  {returnComponent(column.headerName)}
                  {column.headerName}
                </>
              )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
