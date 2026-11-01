import { Box, Typography } from "@mui/material";
import Layout from "../components/Common/Layouts";

const HomePage = () => {
  return (
    <Layout>
      <Box
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        minHeight={"50vh"}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "50px",
              sm: "120px",
            },
          }}
        >
          Welcome
        </Typography>
      </Box>
    </Layout>
  );
};

export default HomePage;
