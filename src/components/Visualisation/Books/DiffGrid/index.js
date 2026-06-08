import { useContext, useState, useEffect } from "react";
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
import { cleanBeforeDiff } from "../../../../utility/Helper";
import { kitabDiff } from "../../../../assets/js/kitabDiff";
import { Context } from "../../../../App";
import "../../../../index.css";


const DiffGrid = ({ parsedBookAlignment, alignmentOnly, currentMs2, bc1, ec1, bc2, ec2 }) => {
  const {
    isFlipped, books, displayMs, setDisplayMs,
    normalizeAlif, normalizeYa, normalizeHa, removePunct, removeTags,
    nSharedChars, nRefineChars, bookIntoRows,
  } = useContext(Context);

  const [open, setOpen] = useState(false);

  const ms2 = currentMs2 ?? books.book2.ms;
  const charRange1 = (bc1 != null && ec1 != null) ? `, chars ${bc1}–${ec1}` : "";
  const charRange2 = (bc2 != null && ec2 != null) ? `, chars ${bc2}–${ec2}` : "";
  let columns = [
    { field: "book1", headerName: `${books.book1.title} (milestone ${books.book1.ms}${charRange1})` },
    { field: "book2", headerName: `${books.book2.title} (milestone ${ms2}${charRange2})` },
  ];
  columns = isFlipped ? [...columns].reverse() : columns;

  // Build raw text for context diffing with MS_START_N markers that survive cleanBeforeDiff.
  // The markers use only letters, digits and underscores, which cleanImech leaves untouched.
  const buildContextRaw = (msNo, beforeAlign, afterAlign, msTexts) => {
    const clean = (t) => cleanBeforeDiff(t ?? "", normalizeAlif, normalizeYa, normalizeHa, removePunct, removeTags);
    const sortedKeys = Object.keys(msTexts ?? {}).map(Number).sort((a, b) => a - b);
    const before = [];
    const after = [clean(afterAlign)];
    for (const k of sortedKeys) {
      if (k < msNo) before.push(`MS_START_${k} ${clean(msTexts[k])}`);
      else if (k > msNo) after.push(`MS_START_${k} ${clean(msTexts[k])}`);
    }
    before.push(`MS_START_${msNo} ${clean(beforeAlign)}`);
    return [before.join(" "), after.join(" ")];
  };

  // Replace MS_START_N markers in diff HTML output with milestone heading markup.
  const formatMsMarkers = (html) => {
    html = html.replace(/MS_START_(\d+)/g, '<span class="msNo"><br/>(start of ms$1)<br/></span>');
    html = html.replace(/<span class="\w+">MS_START_(\d*)<\/span>\s*<span class="(\w+)">?(\d+)/g, '<span class="msNo"><br/>(start of ms$1$3)<br/></span> <span class="$2">');
    return html;
  }

  const [ctxBefore, setCtxBefore] = useState([]);
  const [ctxAfter,  setCtxAfter]  = useState([]);

  useEffect(() => {
    if (alignmentOnly) return;
    let cancelled = false;
    const compute = async () => {
      const [br1, ar1] = buildContextRaw(
        books.book1.ms,
        parsedBookAlignment.beforeAlignment1, parsedBookAlignment.afterAlignment1,
        displayMs.book1
      );
      const [br2, ar2] = buildContextRaw(
        ms2,
        parsedBookAlignment.beforeAlignment2, parsedBookAlignment.afterAlignment2,
        displayMs.book2
      );
      const [, b1Html, b2Html] = await kitabDiff(br1, br2, bookIntoRows, nSharedChars, nRefineChars);
      if (cancelled) return;
      const [, a1Html, a2Html] = await kitabDiff(ar1, ar2, bookIntoRows, nSharedChars, nRefineChars);
      if (cancelled) return;
      const toRows = (h1, h2) => {
        const r1 = h1.split(/ *###NEW_ROW### */g);
        const r2 = h2.split(/ *###NEW_ROW### */g);
        return r1.map((r, i) => ({ book1: formatMsMarkers(r), book2: formatMsMarkers(r2[i] ?? "") }));
      };
      setCtxBefore(toRows(b1Html, b2Html));
      setCtxAfter(toRows(a1Html, a2Html));
    };
    compute();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alignmentOnly, parsedBookAlignment, displayMs,
      normalizeAlif, normalizeYa, normalizeHa, removePunct, removeTags,
      nSharedChars, nRefineChars, bookIntoRows, books.book1.ms, ms2]);

  const alignmentRows = [];
  const splitS1 = parsedBookAlignment.s1.split(/ *###NEW_ROW### */g);
  const splitS2 = parsedBookAlignment.s2.split(/ *###NEW_ROW### */g);
  for (let i = 0; i < splitS1.length; i++) {
    alignmentRows.push({ book1: splitS1[i], book2: splitS2[i] });
  }

  const [spCol, setSpCol] = useState();
  const handleOpen  = (val) => { setSpCol(val); setOpen(true); };
  const handleClose = () => setOpen(false);

  const allRows = [
    ...(alignmentOnly ? [] : ctxBefore),
    ...alignmentRows,
    ...(alignmentOnly ? [] : ctxAfter),
  ];

  return (
    <TableContainer className="diffTableContainer">
      {open && (
        <ExpandView
          open={open}
          handleClose={handleClose}
          rows={allRows}
          spCol={spCol}
          prevLoad={
            spCol.field === "book1" ? (
              <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 2 : 1} books={books} previous={true} />
            ) : (
              <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 1 : 2} books={books} previous={true} />
            )
          }
          nextLoad={
            spCol.field === "book1" ? (
              <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 2 : 1} books={books} previous={false} />
            ) : (
              <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                bookNo={isFlipped ? 1 : 2} books={books} previous={false} />
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
                  <IconButton onClick={() => handleOpen(col)} sx={{ ml: "10px" }}>
                    <i className="fa-solid fa-expand" style={{ fontSize: "12px" }}></i>
                  </IconButton>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ body: { borderBottom: "none" } }} className="diffTableBody">
          <>
            {/* Context before alignment */}
            {!alignmentOnly && (
              <>
                <TableRow className={"diffTableRow"}>
                  <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                    bookNo={isFlipped ? 2 : 1} books={books} previous={true} />
                  <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                    bookNo={isFlipped ? 1 : 2} books={books} previous={true} />
                </TableRow>
                {ctxBefore.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={"diffTableRow"}>
                    {columns.map(col => (
                      <TableCell key={col.field} dir="rtl" align="right"
                        sx={{ verticalAlign: "top" }} className={"diffTableCell"}
                        dangerouslySetInnerHTML={{ __html: row[col.field] }}
                      />
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/* Alignment rows, boxed to set them apart from context */}
            {alignmentRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={"diffTableRow"}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={`${rowIndex}-${col.field}`}
                    dir="rtl" align="right"
                    sx={{ verticalAlign: "top", fontWeight: "bold" }}
                    className={"diffTableCell"}
                    dangerouslySetInnerHTML={{ __html: row[col.field] }}
                  />
                ))}
              </TableRow>
            ))}

            {/* Context after alignment */}
            {!alignmentOnly && (
              <>
                {ctxAfter.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={"diffTableRow"}>
                    {columns.map(col => (
                      <TableCell key={col.field} dir="rtl" align="right"
                        sx={{ verticalAlign: "top" }} className={"diffTableCell"}
                        dangerouslySetInnerHTML={{ __html: row[col.field] }}
                      />
                    ))}
                  </TableRow>
                ))}
                <TableRow className={"diffTableRow"}>
                  <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                    bookNo={isFlipped ? 2 : 1} books={books} previous={false} />
                  <NextMilestoneLoader alignmentOnly={alignmentOnly} displayMs={displayMs} setDisplayMs={setDisplayMs}
                    bookNo={isFlipped ? 1 : 2} books={books} previous={false} />
                </TableRow>
              </>
            )}
          </>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiffGrid;
