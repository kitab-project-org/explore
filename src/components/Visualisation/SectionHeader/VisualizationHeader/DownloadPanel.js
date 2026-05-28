import { useContext, useEffect } from "react";
import { Alert, Box, Button, Typography, Tooltip } from "@mui/material";
import * as d3 from "d3";
import IncludeMetaDropdown from "./IncludeMetaDropdown";
import OutputDimensions from "./OutputDimensions";
import { downloadPNG, downloadSVG, isChrome, mergeChartSVGs, injectBottomBarXAxis } from "../../../../utility/Helper";
import { Context } from "../../../../App";


const DownloadPanel = ( {isPairwiseViz, downloadFileName, includeURL, setIncludeURL, includeSidebar = false, setIncludeSidebar, includeBottomBar = false, setIncludeBottomBar} ) => {
  const {
    tickFontSize,
    outputImageWidth,
    dpi
  } = useContext(Context);

  const svgSelector = isPairwiseViz ? 'svgChart' : 'scatterChart';

  // Estimate output pixel area to detect potential Chrome data-URI size limit issues.
  // Chrome (and other Chromium-based browsers) truncates data URIs beyond ~5MB,
  // producing a corrupt PNG. Threshold: 130 million pixels (set experimentally).
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

  const handleIncludeUrlChange = (e) => {
    setIncludeURL((prev) => !prev);
  };

  // Resolve the SVG element(s) to download: merge when extra components are selected.
  const getSvgTarget = () => {
    if (!isPairwiseViz && (includeURL || includeSidebar || includeBottomBar)) {
      const ids = ['scatterChart'];
      if (includeURL)       ids.push('url-label-svg');
      if (includeSidebar)   ids.push('side-bar');
      if (includeBottomBar) ids.push('bottom-bar');
      const merged = mergeChartSVGs(ids);
      if (!merged) return svgSelector;
      if (!includeBottomBar) injectBottomBarXAxis(merged, ids);
      return merged;
    }
    return svgSelector;
  };

  // Apply font size when it changes
  // NB: For the pairwise viz, this is overridden by the redrawing of the chart;
  //     so it has to be changed there as well.
  useEffect(() => {
    const tickTexts = d3.selectAll("#chartBox .tick text");
    tickTexts.style("font-size", `${tickFontSize}px`);
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
        display={"flex"}
        justifyContent={"right"}
        flexWrap={"wrap"}
        sx={{
          alignItems: "center",
          px: {
            xs: "25px",
            sm: "25px",
          },
          gap: "10px",
          bgcolor: "#F0F0F5",
          borderRadius: "5px",
          position: "relative",
          borderTop: "1px solid white",
          padding: "5px"
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }}>Download options:</Typography>
        <OutputDimensions/>
        {isPairwiseViz && <IncludeMetaDropdown/>}
        <Tooltip placement="top" title={"Include URL of this visualization in the downloaded image?"}>
          <Button onClick={handleIncludeUrlChange}>
            <Box display="flex" alignItems="center">
              <Typography
                ariant="body2"
                sx={{ textTransform: "none", color: "#333" }}
              >
                Include URL:&nbsp;
              </Typography>
              <Typography sx={{ mr: "8px", mt: "2px" }}>
                {includeURL ? (
                    <i className="fa-solid fa-square-check"></i>
                ) : (
                    <i className="fa-regular fa-square"></i>
                )}
              </Typography>
            </Box>
          </Button>
        </Tooltip>
        {!isPairwiseViz && (
          <>
            <Button onClick={() => setIncludeSidebar(v => !v)}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ textTransform: "none", color: "#333" }}>
                  Include sidebar:&nbsp;
                </Typography>
                <Typography sx={{ mr: "8px", mt: "2px" }}>
                  {includeSidebar
                    ? <i className="fa-solid fa-square-check"></i>
                    : <i className="fa-regular fa-square"></i>}
                </Typography>
              </Box>
            </Button>
            <Button onClick={() => setIncludeBottomBar(v => !v)}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ textTransform: "none", color: "#333" }}>
                  Include bottom bar:&nbsp;
                </Typography>
                <Typography sx={{ mr: "8px", mt: "2px" }}>
                  {includeBottomBar
                    ? <i className="fa-solid fa-square-check"></i>
                    : <i className="fa-regular fa-square"></i>}
                </Typography>
              </Box>
            </Button>
          </>
        )}
        <Button
          onClick={() => downloadPNG(getSvgTarget(), downloadFileName, outputImageWidth, dpi)}
          color="primary"
          variant="outlined"
          rel="noreferrer"
          target="_blank"
          style={{textTransform: 'none'}}
        >
          Download PNG
        </Button>
        <Button
          onClick={() => downloadSVG(getSvgTarget(), downloadFileName)}
          color="primary"
          variant="outlined"
          rel="noreferrer"
          target="_blank"
          style={{textTransform: 'none'}}
        >
          Download SVG
        </Button>
      </Box>
    </>
  );
};

export default DownloadPanel;
