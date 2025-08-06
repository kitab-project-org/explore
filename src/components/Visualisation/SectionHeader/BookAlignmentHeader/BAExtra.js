import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import Normalization from "./Normalization";
import Highlights from "../../BooksAlignment/Highlights";
import { Context } from "../../../../App";


const BAExtra = () => {
  const { 
    booksAlignment, 
    setWikiEdDiff, 
    bookIntoRows, 
    setBookIntoRows,
   } =
    useContext(Context);
  const handleIsRow = () => {
    setBookIntoRows(!bookIntoRows);
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        sx={{
          alignItems: "center",
          
          px: {
            xs: "10px",
            sm: "25px",
          },
          gap: "10px",
          bgcolor: "#F0F0F5",
          borderRadius: "5px",
          position: "relative",
          borderTop: "1px solid white",
        }}
      >
        {booksAlignment?.s1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              sx={{ mr: "25px", alignItems:"center" }}
              display="flex"
              
              onClick={() => setWikiEdDiff(true)}
            >
              <Typography sx={{ mr: "8px", mt: "2px" }}>
                <i className="fa-solid fa-eye"></i>
              </Typography>
              <Typography
                variant="body2"
                sx={{ textTransform: "none", color: "#333" }}
              >
                View compound text (WikiEdDiff)
              </Typography>
            </Button>
            <Button onClick={handleIsRow}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ mr: "8px", mt: "2px" }}>
                  {bookIntoRows ? (
                    <i className="fa-solid fa-square-check"></i>
                  ) : (
                    <i className="fa-regular fa-square"></i>
                  )}
                </Typography>
                <Typography
                  ariant="body2"
                  sx={{ textTransform: "none", color: "#333" }}
                >
                  Divide Into Rows (for easier comparison)
                </Typography>
              </Box>
            </Button>
            <Normalization />
            <Highlights />
          </Box>
        )}
      </Box>
    </>
  );
};

export default BAExtra;
