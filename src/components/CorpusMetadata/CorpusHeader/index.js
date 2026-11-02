import { Box, Typography } from "@mui/material";
import TourMenu from "../../GuidedTour/TourMenu";
import VersionDropdown from "../../Common/VersionDropdown";

const CorpusHeader = ({ onStartTour }) => {
  return (
    <Box
      id="CorpusHeader"
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
      <Box display="flex" alignItems="center" gap={1}>
        <TourMenu buttonId="take-a-tour-btn" current="main" onStartTour={onStartTour} />
        <VersionDropdown />
      </Box>
    </Box>
  );
};

export default CorpusHeader;
