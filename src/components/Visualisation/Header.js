import { Box, Button, Tooltip, Typography } from "@mui/material";
import VersionDropdown from "../Common/VersionDropdown";

const Header = (props) => {
  //console.log("Rendering visualisation header");

  return (
    <div>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{
          flexDirection: { xs: "column", md: "row" },
          boxSizing: "border-box",
          px: "20px",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          sx={{
            mb: {
              xs: "20px",
              md: "0px",
            },
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "20px",
                sm: "34px",
              },
              marginBottom: "0px",
            }}
          >
            {props.isPairwiseViz 
              ? "Pairwise Text Reuse Visualisation"
              : "Corpus-wide Text Reuse Visualisation"
            }
          </Typography>
          <Tooltip title="Raise Issue" placement="top">
            <Button
              color="primary"
              variant="outlined"
              href="https://github.com/kitab-project-org/kitab-project-org.github.io/issues/new?assignees=mabarber92&labels=applications&template=bug-report--tweaks--kitab-applications.md&title=Application+Bug:+Pairwise+Book+Visualisation"
              rel="noreferrer"
              target="_blank"
              sx={{
                textTransform: "capitalize",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                minWidth: "0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: "#9ca3af",
                border: "1px solid #d1d5db",
                ml: "20px",
              }}
            >
              <i className="fa-solid fa-bug"></i>
            </Button>
          </Tooltip>
        </Box>
        <VersionDropdown/>
      </Box>
    </div>
  );
};

export default Header;
