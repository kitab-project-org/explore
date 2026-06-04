import { Box, Button, Chip, IconButton, Link, Tooltip, Typography } from "@mui/material";
import FlipButton from "./FlipButton";


const VisualizationHeader = ({ restoreCanvas, isPairwiseViz, showFilterPanel, setShowFilterPanel, showDownloadOptions, setShowDownloadOptions, activeFilters, zoomMode, setZoomMode }) => {

  return (
    <Box sx={{ postion: "relative" }} id="visualization-header">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Link
          href={isPairwiseViz
            ? "https://kitab-project.org/data/viz#the-pairwise-text-reuse-visualisation"
            : "https://kitab-project.org/data/viz#scatter-viz"
          }
          target="_blank"
        >
          <IconButton sx={{color: "#2862a5"}}>
            <i className="fa-regular fa-circle-question" style={{ fontSize: "18px" }}></i>
          </IconButton>
        </Link>

        {/* Filter chips — shown when filter panel is closed and filters are active */}
        <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={0.5} sx={{ flexGrow: 1, mx: 1 }}>
          {!isPairwiseViz && !showFilterPanel && activeFilters?.length > 0 && (
            <>
              <Typography variant="body2" sx={{ color: "#333", whiteSpace: "nowrap" }}>
                Filters:
              </Typography>
              {activeFilters.map((label, i) => (
                <Chip
                  key={i}
                  label={label}
                  size="small"
                  onClick={() => setShowFilterPanel(true)}
                  sx={{ bgcolor: "#e5e7eb", cursor: "pointer", fontSize: "0.75rem" }}
                />
              ))}
            </>
          )}
        </Box>

        <Box display="flex" alignItems="center">
          <Tooltip title="Reset Chart" placement="top">
            <Button
              color="primary"
              variant="outlined"
              onClick={restoreCanvas}
              sx={{
                width: "35px", height: "35px", borderRadius: "50%", minWidth: "0px",
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: "14px", color: "#2862a5", border: "1px solid #2862a5", mr: "10px",
              }}
            >
              <i className="fa-solid fa-arrows-rotate"></i>
            </Button>
          </Tooltip>
          {isPairwiseViz ? <FlipButton /> : ""}
          {isPairwiseViz && setZoomMode && (
            <Tooltip title={zoomMode ? "Exit zoom mode" : "Zoom mode"} placement="top">
              <Button
                onClick={() => setZoomMode(v => !v)}
                color="primary"
                variant="outlined"
                sx={{
                  width: "35px", height: "35px", borderRadius: "50%", minWidth: "0px",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  fontSize: "14px",
                  color: zoomMode ? "#fff" : "#2862a5",
                  bgcolor: zoomMode ? "#2862a5" : "transparent",
                  border: "1px solid #2862a5", mr: "10px",
                  "&:hover": { bgcolor: zoomMode ? "#1e4d8c" : undefined },
                }}
              >
                <i className="fa-solid fa-magnifying-glass-plus"></i>
              </Button>
            </Tooltip>
          )}
          {setShowFilterPanel && (
            <Tooltip title={isPairwiseViz ? "Filter by table of contents" : "Filter options and settings"} placement="top">
              <Button
                onClick={() => setShowFilterPanel(v => !v)}
                color="primary"
                variant="outlined"
                sx={{
                  width: "35px", height: "35px", borderRadius: "50%", minWidth: "0px",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  fontSize: "14px",
                  color: showFilterPanel ? "#fff" : "#2862a5",
                  bgcolor: showFilterPanel ? "#2862a5" : "transparent",
                  border: "1px solid #2862a5", mr: "10px",
                  "&:hover": { bgcolor: showFilterPanel ? "#1e4d8c" : undefined },
                }}
              >
                <i className={isPairwiseViz ? "fa-solid fa-filter" : "fa-solid fa-gear"}></i>
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Download Chart and select download options" placement="top">
            <Button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              color="primary"
              variant="outlined"
              sx={{
                width: "35px", height: "35px", borderRadius: "50%", minWidth: "0px",
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: "14px",
                color: showDownloadOptions ? "#fff" : "#2862a5",
                bgcolor: showDownloadOptions ? "#2862a5" : "transparent",
                border: "1px solid #2862a5", mr: "10px",
                "&:hover": { bgcolor: showDownloadOptions ? "#1e4d8c" : undefined },
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
