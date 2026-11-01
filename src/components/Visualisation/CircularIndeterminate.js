import { Box, CircularProgress } from "@mui/material";

const CircularInterminate = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "150px",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default CircularInterminate;
