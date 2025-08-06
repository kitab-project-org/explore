import { useContext } from "react";
import { IconButton, Link, Box, Tooltip } from "@mui/material";
import ColorKeys from "../../BooksAlignment/ColorKeys";
import { Context } from "../../../../App";

const BookAlignmentHeader = () => {
  const { booksAlignment, showOptions, setShowOptions } = useContext(Context);

  return (
    <Box sx={{ postion: "relative" }}>
      {booksAlignment?.s1 && (
        <Box display="flex" justifyContent="space-between">
          <Link
            href="https://kitab-project.org/data/viz#diff-viewer"
            target="_blank"
          >
            <IconButton
              sx={{
                color: "#2862a5",
              }}
            >
              <i
                className="fa-regular fa-circle-question"
                style={{ fontSize: "18px" }}
              ></i>
            </IconButton>
          </Link>
          <ColorKeys />
          <Box display="flex" alignItems="center">
            {/* <Tooltip placement="top" title="Download">
              <IconButton
                sx={{
                  color: "#2862a5",
                  width: "40px",
                  height: "40px",
                }}
              >
                <i
                  className="fa-solid fa-cloud-arrow-down"
                  style={{
                    fontSize: "20px",
                  }}
                ></i>
              </IconButton>
            </Tooltip> */}
            <Tooltip placement="top" title="Options">
              <IconButton
                sx={{ ml: "5px", color: "#2862a5", fontSize: "20px" }}
                onClick={() => setShowOptions(!showOptions)}
              >
                <i className="fa-solid fa-gear"></i>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BookAlignmentHeader;
