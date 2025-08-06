import { useContext, useState } from "react";
import {
  IconButton,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Tooltip
} from "@mui/material";
import NextMilestoneLoader from "../NextMilestoneLoader";
import ExpandView from "../../Books/ExpandView";
import { imechToHtml } from "../../../../utility/Helper";
import { Context } from "../../../../App";
import "../../../../index.css";


const DiffGrid = ({ parsedBookAlignment, alignmentOnly }) => {
  const { isFlipped, books, displayMs, setDisplayMs } = useContext(Context);

  const [open, setOpen] = useState(false);

  let columns = [
    {
      field: "book1",
      headerName: `${books.book1.title} (milestone ${books.book1.ms})`,
    },
    {
      field: "book2",
      headerName: `${books.book2.title} (milestone ${books.book2.ms})`,
    },
  ];
  columns = isFlipped ? columns.reverse() : columns;
  const createMsContext = (
    msNo,
    beforeAlignment,
    afterAlignment,
    displayMs
  ) => {
    console.log("msNo", msNo);
    console.log("beforeAlignment", beforeAlignment);
    console.log("afterAlignment", afterAlignment);
    console.log("displayMs", displayMs);
    let before = [];
    let after = [];
    const sortedKeys = Object.keys(displayMs).sort();
    after.push(`<div>${imechToHtml(afterAlignment)}</div>`);
    for (let k of sortedKeys) {
      if (parseInt(k) < msNo) {
        before.push(
          `<div class="msNo">(start of ms${k})</div><div>${imechToHtml(
            displayMs[k]
          )}</div>`
        );
      } else if (parseInt(k) > msNo) {
        after.push(
          `<div class="msNo">(start of ms${k})</div><div>${imechToHtml(
            displayMs[k]
          )}</div>`
        );
      }
    }
    before.push(
      `<div class="msNo">(start of ms${msNo})</div><div>${imechToHtml(
        beforeAlignment
      )}</div>`
    );
    return [before.join("\n"), after.join("\n")];
  };

  const [before1, after1] = createMsContext(
    books.book1.ms,
    parsedBookAlignment.beforeAlignment1,
    parsedBookAlignment.afterAlignment1,
    displayMs.book1
  );
  const [before2, after2] = createMsContext(
    books.book2.ms,
    parsedBookAlignment.beforeAlignment2,
    parsedBookAlignment.afterAlignment2,
    displayMs.book2
  );

  const beforeAlignmentRow = [
    {
      book1: before1,
      book2: before2,
    },
  ];

  const afterAlignmentRow = [
    {
      book1: after1,
      book2: after2,
    },
  ];

  const alignmentRows = [];
  const splitS1 = parsedBookAlignment.s1.split(/ *###NEW_ROW### */g);
  const splitS2 = parsedBookAlignment.s2.split(/ *###NEW_ROW### */g);
  for (let i = 0; i < splitS1.length; i++) {
    alignmentRows.push({
      book1: splitS1[i],
      book2: splitS2[i],
    });
  }

  const rows = alignmentOnly
    ? alignmentRows
    : [...beforeAlignmentRow, ...alignmentRows, ...afterAlignmentRow];

  const [spCol, setSpCol] = useState();
  const handleOpen = (val) => {
    setSpCol(val);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <TableContainer className="diffTableContainer">
      {open && (
        <ExpandView
          open={open}
          handleClose={handleClose}
          rows={[...beforeAlignmentRow, ...alignmentRows, ...afterAlignmentRow]}
          spCol={spCol}
          prevLoad={
            spCol.field === "book1" ? (
              <NextMilestoneLoader
                alignmentOnly={alignmentOnly}
                displayMs={displayMs}
                setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 2 : 1}
                books={books}
                previous={true}
              />
            ) : (
              <NextMilestoneLoader
                alignmentOnly={alignmentOnly}
                displayMs={displayMs}
                setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 1 : 2}
                books={books}
                previous={true}
              />
            )
          }
          nextLoad={
            spCol.field === "book1" ? (
              <NextMilestoneLoader
                alignmentOnly={alignmentOnly}
                displayMs={displayMs}
                setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 2 : 1}
                books={books}
                previous={false}
              />
            ) : (
              <NextMilestoneLoader
                alignmentOnly={alignmentOnly}
                displayMs={displayMs}
                setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 1 : 2}
                books={books}
                previous={false}
              />
            )
          }
        />
      )}
      <Table size="small" stickyHeader className="diffTable">
        <TableHead columns={columns} className="diffTableHeader">
          <TableRow className={"diffTableHeaderRow"}>
            {columns.map((col, colIndex) => (
              <TableCell
                className={"diffHeaderCell"}
                key={colIndex}
                align="center"
                style={{ width: "50%" }}
              >
                {col.headerName}
                <Tooltip title="Expand View" placement="top">
                  <IconButton
                    onClick={() => handleOpen(col)}
                    sx={{ ml: "10px" }}
                  >
                    <i
                      className="fa-solid fa-expand"
                      style={{ fontSize: "12px" }}
                    ></i>
                  </IconButton>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            body: {
              borderBottom: "none",
            },
          }}
          className="diffTableBody"
        >
          <>
            {!alignmentOnly && (
              <TableRow className={"diffTableRow"}>
                <NextMilestoneLoader
                  alignmentOnly={alignmentOnly}
                  displayMs={displayMs}
                  setDisplayMs={setDisplayMs}
                  bookNo={isFlipped ? 2 : 1}
                  books={books}
                  previous={true}
                />
                <NextMilestoneLoader
                  alignmentOnly={alignmentOnly}
                  displayMs={displayMs}
                  setDisplayMs={setDisplayMs}
                  bookNo={isFlipped ? 1 : 2}
                  books={books}
                  previous={true}
                />
              </TableRow>
            )}

            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex + 1} className={"diffTableRow"}>
                {columns.map((col) => (
                  <TableCell
                    key={`${rowIndex + 1}-${col.field}`}
                    dir="rtl"
                    align="right"
                    sx={{ verticalAlign: "top" }}
                    className={"diffTableCell"}
                    dangerouslySetInnerHTML={{
                      __html: row[col.field],
                    }}
                  ></TableCell>
                ))}
              </TableRow>
            ))}
            {!alignmentOnly && (
              <TableRow className={"diffTableRow"}>
                <NextMilestoneLoader
                  alignmentOnly={alignmentOnly}
                  displayMs={displayMs}
                  setDisplayMs={setDisplayMs}
                  bookNo={isFlipped ? 2 : 1}
                  books={books}
                  previous={false}
                />
                <NextMilestoneLoader
                  alignmentOnly={alignmentOnly}
                  displayMs={displayMs}
                  setDisplayMs={setDisplayMs}
                  bookNo={isFlipped ? 1 : 2}
                  books={books}
                  previous={false}
                />
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiffGrid;
