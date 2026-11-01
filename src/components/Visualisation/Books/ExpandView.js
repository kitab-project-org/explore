import { useContext, useState } from "react";
import { 
  Box, 
  FormControlLabel, 
  IconButton, 
  Modal, 
  Switch, 
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from "@mui/material";
import { Context } from "../../../App";
import { imechToHtml } from "../../../utility/Helper";

// open the reader (read 300 milestones at once)
const ExpandView = ({ open, handleClose, rows, spCol, nextLoad, prevLoad }) => {
  const { downloadedTexts, releaseCode, books } = useContext(Context);
  const [fontSizeState, setFontSizeState] = useState(20);
  const [isFullBook, setIsFullBook] = useState(false);

  const fullBook =
    spCol.field === "book1"
      ? downloadedTexts[releaseCode][books.book1.versionCode]?.downloadedMs
          ?.msTexts
      : downloadedTexts[releaseCode][books.book2.versionCode]?.downloadedMs
          ?.msTexts;

  const handleFontSize = (eType) => {
    if (eType === "plus") {
      if (fontSizeState >= 40) {
        setFontSizeState(40);
      } else {
        setFontSizeState(fontSizeState + 4);
      }
    } else {
      if (fontSizeState <= 16) {
        setFontSizeState(16);
      } else {
        setFontSizeState(fontSizeState - 4);
      }
    }
  };

  const handleFullbook = (e) => {
    setIsFullBook(e.target.checked);
  };

  // Expand View Completed

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100vh",
    bgcolor: "background.paper",
    boxSizing: "border-box",
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box
          display={"flex"}
          height={"50px"}
          width={"100%"}
          bgcolor={"#f3f4f6"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Box px={"20px"}>
            <Typography variant="body1">
              {spCol?.field} : {spCol?.headerName}
            </Typography>
          </Box>

          <Box px={"20px"} display={"flex"} alignItems={"center"} gap={"10px"}>
            <FormControlLabel
              checked={isFullBook}
              onChange={handleFullbook}
              control={<Switch defaultChecked />}
              label="Full Book"
            />
            <IconButton
              sx={{ fontSize: "18px" }}
              onClick={() => handleFontSize("minus")}
            >
              <i className="fa-solid fa-minus"></i>
            </IconButton>
            <IconButton
              sx={{ fontSize: "18px" }}
              onClick={() => handleFontSize("plus")}
            >
              <i className="fa-solid fa-plus"></i>
            </IconButton>
            <IconButton sx={{ fontSize: "18px" }} onClick={handleClose}>
              <i className="fa-solid fa-down-left-and-up-right-to-center"></i>
            </IconButton>
          </Box>
        </Box>
        <Box
          sx={{
            height: "calc(100vh - 50px)",
            width: "100%",
            overflow: "hidden",
            overflowY: "scroll",
            px: {
              sm: "30px",
              lg: "200px",
              xl: "400px",
            },
            boxSizing: "border-box",
            py: "50px",
          }}
        >
          <TableContainer className="diffTableContainer">
            <Table size="small" stickyHeader className="diffTable">
              {isFullBook ? (
                <TableBody
                  sx={{
                    body: {
                      borderBottom: "none",
                    },
                  }}
                  className="diffTableBody"
                >
                  {Object.keys(fullBook).map((item, i) => (
                    <TableRow key={i} className={"diffTableRow"}>
                      <TableCell
                        dir="rtl"
                        align="right"
                        sx={{
                          verticalAlign: "top",
                          fontSize: `${fontSizeState}px`,
                        }}
                        className={"diffTableCell"}
                        dangerouslySetInnerHTML={{
                          __html: imechToHtml(Object.values(fullBook)[i]),
                        }}
                      ></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody
                  sx={{
                    body: {
                      borderBottom: "none",
                    },
                  }}
                  className="diffTableBody"
                >
                  {<TableRow className={"diffTableRow"}>{prevLoad}</TableRow>}
                  {rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex + 1} className={"diffTableRow"}>
                      <TableCell
                        key={`${rowIndex + 1}-${spCol?.field}`}
                        dir="rtl"
                        align="right"
                        sx={{
                          verticalAlign: "top",
                          fontSize: `${fontSizeState}px`,
                        }}
                        className={"diffTableCell"}
                        dangerouslySetInnerHTML={{
                          __html: row[spCol?.field],
                        }}
                      ></TableCell>
                    </TableRow>
                  ))}
                  {<TableRow className={"diffTableRow"}>{nextLoad}</TableRow>}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExpandView;
