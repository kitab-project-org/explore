import {
  Box,
  CircularProgress,
  //Input,    // mui Input object has difficulties with multiple files
  InputLabel,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { Context } from "../../App";
import { Link } from "react-router-dom";

const UploadInput = ({ item, handleUpload }) => {
  console.log("Rendering UploadInput");
  const { dataLoading } = useContext(Context);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          my: {
            xs: "30px",
            md: "40px",
          },
          mb: "40px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: {
                xs: "16px",
                md: "22px",
              },
            }}
            px={1}
          >
            Select texts to visualize{" "}
            <Link to={"/metadata"} style={{ color: "#2862a5" }}>
              from the metadata
            </Link>{" "}
            or upload a
          </Typography>
          <Typography
            sx={{
              fontSize: {
                xs: "16px",
                md: "22px",
              },
            }}
          >
            <InputLabel
              htmlFor={item.title}
              sx={{
                cursor: "pointer",
                color: "#2862a5",
              }}
            >
              TSV file <i className="fa-solid fa-cloud-arrow-up"></i>
            </InputLabel>
          </Typography>
        </Box>
      </Box>
       {/*<Input
        type="file"
        id={item.title}
        sx={{ display: "none" }}
        onChange={(e) => handleUpload(e.target.files[0])}
      />*/}
     <input
        type="file"
        id={item.title}
        style={{ display: "none" }}
        multiple
        onChange={(e) => handleUpload(e.target.files)}
      />
      {dataLoading?.uploading && (
        <Box
          width="100%"
          height="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        > 
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default UploadInput;
