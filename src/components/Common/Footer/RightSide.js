import { Box, Link, Typography } from "@mui/material";
import ISMCImage from "../../../assets/footer/ismc.jpg";
import ERCImage from "../../../assets/footer/flag.jpg";

const RightSide = () => {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "5px",
        border: "1px solid #cecfd1",
        color: "#3d4144",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: {
          xs: "100%",
          sm: "580px",
        },
        marginTop: {
          xs: "30px",
          sm: "30px",
          md: "0px",
        },
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        gap={"5px"}
        sx={{
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          padding: {
            xs: "50px 20px",
            sm: "10px 20px",
          },
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Our Sponsors:
        </Typography>
        <Link href="https://www.aku.edu/ismc/Pages/home.aspx">
          <img src={ISMCImage} alt="AKU-ISMC" />
        </Link>
        <Link href="https://erc.europa.eu/">
          <img src={ERCImage} alt="ERC" />
        </Link>
      </Box>
    </Box>
  );
};

export default RightSide;
