import { Box } from "@mui/material";

const LoaderIcon = () => {
  return (
    <Box
      className="loaderIcon"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundImage: "conic-gradient(white, grey)",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        zIndex: 9990,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          bgcolor: "white",
          zIndex: 9999,
        }}
      ></Box>
    </Box>
  );
};

export default LoaderIcon;
