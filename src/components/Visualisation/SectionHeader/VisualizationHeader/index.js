import { Box, Button, IconButton, Link, Tooltip } from "@mui/material";
import FlipButton from "./FlipButton";
import ScatterLegend from "../../MultiChart/ScatterLegend";


const VisualizationHeader = ({ restoreCanvas, isPairwiseViz, colorScale, width, showFilterPanel, setShowFilterPanel, showDownloadOptions, setShowDownloadOptions }) => {
  
  return (
    <Box sx={{ postion: "relative" }} id="visualization-header">
      <Box display="flex" justifyContent="space-between">
        <Link
          href={isPairwiseViz 
            ? "https://kitab-project.org/data/viz#the-pairwise-text-reuse-visualisation"
            : "https://kitab-project.org/data/viz#scatter-viz"
          }
          target="_blank"
        >
          <IconButton
            sx={{color: "#2862a5"}}
          >
            <i
              className="fa-regular fa-circle-question"
              style={{ fontSize: "18px" }}
            ></i>
          </IconButton>
        </Link>
        <Box display="flex" alignItems="center">
          {isPairwiseViz ? "" : (
            <ScatterLegend 
              colorScale={colorScale}
              width={width/2}
              margin={50}
            />
          )}
        </Box>

        <Box display="flex" alignItems="center">
          
          <Tooltip title="Reset Chart" placement="top">
            <Button
              color="primary"
              variant="outlined"
              rel="noreferrer"
              target="_blank"
              onClick={restoreCanvas}
              sx={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                minWidth: "0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: "#2862a5",
                border: "1px solid #2862a5",
                mr: "10px",
              }}
            >
              <i className="fa-solid fa-arrows-rotate"></i>
            </Button>
          </Tooltip>
          {isPairwiseViz ? <FlipButton /> : ""}
          {!isPairwiseViz && setShowFilterPanel && (
            <Tooltip title="Filter options" placement="top">
              <Button
                onClick={() => setShowFilterPanel(v => !v)}
                color="primary"
                variant="outlined"
                sx={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  minWidth: "0px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "14px",
                  color: showFilterPanel ? "#fff" : "#2862a5",
                  bgcolor: showFilterPanel ? "#2862a5" : "transparent",
                  border: "1px solid #2862a5",
                  mr: "10px",
                  "&:hover": {
                    bgcolor: showFilterPanel ? "#1e4d8c" : undefined,
                  },
                }}
              >
                <i className="fa-solid fa-filter"></i>
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Download Chart and select download options" placement="top">
            <Button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              color="primary"
              variant="outlined"
              rel="noreferrer"
              target="_blank"
              sx={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                minWidth: "0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: showDownloadOptions ? "#fff" : "#2862a5",
                bgcolor: showDownloadOptions ? "#2862a5" : "transparent",
                border: "1px solid #2862a5",
                mr: "10px",
                "&:hover": {
                  bgcolor: showDownloadOptions ? "#1e4d8c" : undefined,
                },
              }}
            >
              <i className="fa-solid fa-cloud-arrow-down"></i>
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default VisualizationHeader;
