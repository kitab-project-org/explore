import { Box, Button, Typography } from "@mui/material";
import TourIcon from "@mui/icons-material/Tour";
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
        <Button
          id="take-a-tour-btn"
          size="small"
          variant="outlined"
          startIcon={<i className="fa-solid fa-signs-post"></i>}
          onClick={onStartTour}
          sx={{ textTransform: "none", whiteSpace: "nowrap" }}
        >
          Take a tour
        </Button>
        <VersionDropdown />
      </Box>
    </Box>
  );
};

export default CorpusHeader;
