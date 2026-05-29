import { useContext, useEffect } from "react";
import { Alert, Box, Button, Typography, Tooltip } from "@mui/material";
import * as d3 from "d3";
import IncludeMetaDropdown from "./IncludeMetaDropdown";
import OutputDimensions from "./OutputDimensions";
import { downloadPNG, downloadSVG, isChrome, mergeChartSVGs, injectBottomBarXAxis } from "../../../../utility/Helper";
import { Context } from "../../../../App";

const rowSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "6px",
  px: "10px",
  py: "4px",
};

const CheckButton = ({ label, checked, onClick }) => (
  <Button onClick={onClick} size="small">
    <Box display="flex" alignItems="center">
      <Typography sx={{ textTransform: "none", color: "#333", fontSize: "0.875rem" }}>
        {label}&nbsp;
      </Typography>
      <Typography sx={{ mt: "2px", fontSize: "0.875rem" }}>
        {checked
          ? <i className="fa-solid fa-square-check"></i>
          : <i className="fa-regular fa-square"></i>}
      </Typography>
    </Box>
  </Button>
);

const DownloadPanel = ( {isPairwiseViz, downloadFileName, includeURL, setIncludeURL, includeLegend = false, setIncludeLegend, includeSidebar = false, setIncludeSidebar, includeBottomBar = false, setIncludeBottomBar} ) => {
  const {
    tickFontSize,
    outputImageWidth,
    dpi
  } = useContext(Context);

  const svgSelector = isPairwiseViz ? 'svgChart' : 'scatterChart';

  const CHROME_PIXEL_THRESHOLD = 130_000_000;
  const showChromeWarning = (() => {
    if (!outputImageWidth || !isChrome()) return false;
    const svgEl = document.getElementById(svgSelector);
    if (!svgEl) return false;
    const svgPixelWidth = svgEl.clientWidth || 1;
    const svgPixelHeight = svgEl.clientHeight || 1;
    const targetPixelWidth = (outputImageWidth / 25.4) * (dpi || 300);
    const scale = targetPixelWidth / svgPixelWidth / (window.devicePixelRatio || 1);
    const targetPixelHeight = svgPixelHeight * scale;
    return targetPixelWidth * targetPixelHeight > CHROME_PIXEL_THRESHOLD;
  })();

  const getSvgTarget = () => {
    if (!isPairwiseViz && (includeURL || includeLegend || includeSidebar || includeBottomBar)) {
      const ids = ['scatterChart'];
      if (includeURL)       ids.push('url-label-svg');
      if (includeLegend)    ids.push('legend-svg');
      if (includeSidebar)   ids.push('side-bar');
      if (includeBottomBar) ids.push('bottom-bar');
      const merged = mergeChartSVGs(ids);
      if (!merged) return svgSelector;
      if (!includeBottomBar) injectBottomBarXAxis(merged, ids);
      return merged;
    }
    return svgSelector;
  };

  // Apply tick font size when it changes.
  // NB: For the pairwise viz this is overridden by the chart redraw.
  useEffect(() => {
    d3.selectAll("#chartBox .tick text").style("font-size", `${tickFontSize}px`);
  }, [tickFontSize]);

  return (
    <>
      {showChromeWarning && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          The requested PNG is very large. Google Chrome may produce a corrupt file at this size.
          Try reducing the width or DPI, or download using Firefox instead.
        </Alert>
      )}
      <Box
        id="download-panel"
        sx={{
          bgcolor: "#F0F0F5",
          borderRadius: "5px",
          borderTop: "1px solid white",
        }}
      >
        {/* Row 1: dimension / font size controls */}
        <Box sx={rowSx}>
          <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
            Download options:
          </Typography>
          <OutputDimensions />
          {isPairwiseViz && <IncludeMetaDropdown />}
        </Box>

        {/* Row 2: include checkboxes + download buttons */}
        <Box sx={{ ...rowSx }}>
          <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
            Include:
          </Typography>
          <Tooltip placement="top" title="Include the URL of this visualization in the downloaded image">
            <span>
              <CheckButton label="URL" checked={includeURL} onClick={() => setIncludeURL(v => !v)} />
            </span>
          </Tooltip>
          {!isPairwiseViz && (
            <>
              <Tooltip placement="top" title="Include the color legend in the downloaded image">
                <span><CheckButton label="Legend" checked={includeLegend} onClick={() => setIncludeLegend(v => !v)} /></span>
              </Tooltip>
              <Tooltip placement="top" title="Include the sidebar (characters reused per milestone) in the downloaded image">
                <span><CheckButton label="Sidebar" checked={includeSidebar} onClick={() => setIncludeSidebar(v => !v)} /></span>
              </Tooltip>
              <Tooltip placement="top" title="Include the bottom bar (characters reused per book) in the downloaded image">
                <span><CheckButton label="Bottom bar" checked={includeBottomBar} onClick={() => setIncludeBottomBar(v => !v)} /></span>
              </Tooltip>
            </>
          )}
          <Box sx={{ ml: "auto", display: "flex", gap: "6px" }}>
            <Button
              onClick={() => downloadPNG(getSvgTarget(), downloadFileName, outputImageWidth, dpi)}
              color="primary" variant="outlined" style={{ textTransform: "none" }}
            >
              Download PNG
            </Button>
            <Button
              onClick={() => downloadSVG(getSvgTarget(), downloadFileName)}
              color="primary" variant="outlined" style={{ textTransform: "none" }}
            >
              Download SVG
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DownloadPanel;
