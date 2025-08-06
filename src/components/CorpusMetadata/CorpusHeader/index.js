import { Box, Typography } from "@mui/material";
import VersionDropdown from "../../Common/VersionDropdown";

const CorpusHeader = () => {
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
      sx={{
        paddingTop: {
          xs: "0px",
          sm: 4,
        },
        paddingBottom: {
          xs: "0px",
          sm: 2,
        },
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: "18px",
            sm: "30px",
          },
        }}
      >
        OpenITI Corpus Metadata
      </Typography>
      <VersionDropdown />
    </Box>
  );
};

export default CorpusHeader;
