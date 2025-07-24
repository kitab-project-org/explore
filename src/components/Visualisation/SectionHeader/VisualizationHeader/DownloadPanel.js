import React from "react";
import { useContext, useRef, useEffect } from "react";
import { Context } from "../../../../App";
import { Box } from "@mui/material";
import { Button, TextField, Typography, Tooltip } from "@mui/material";
import * as d3 from "d3";
//import TickFontSizeControl from "./TickFontSizeControl";


const DownloadPanel = ( {isPairwiseViz, downloadFileName} ) => {
  const { 
    downloadPNG, 
    tickFontSize, 
    setTickFontSize,
    outputImageWidth,
    setOutputImageWidth,
    dpi, 
    setDpi,
    includeURL,
    setIncludeURL
  } = useContext(Context);
  const tickInputRef = useRef(null);
  const widthInputRef = useRef(null);
  const dpiInputRef = useRef(null);
  const svgSelector = isPairwiseViz ? '#svgChart' : '#scatter-chart';

  const handleInputChange = (e) => {
    setTickFontSize(parseInt(e.target.value) || 12);
  };

  const handleWidthInputChange = (e) => {
    setOutputImageWidth(parseInt(e.target.value) || 120);
  }

  const handleDpiInputChange = (e) => {
    setDpi(parseInt(e.target.value) || 300);
  }

  const handleIncludeURL = () => {
    setIncludeURL((prev) => !prev);
  }

  // Apply font size when it changes
    useEffect(() => {
      // TODO: fix the font size for one-to-many chart!
      console.log(`${svgSelector} .tick text`);
      d3.selectAll(`${svgSelector} .tick text`).style("font-size", `${tickFontSize}px`);
    }, [tickFontSize, svgSelector]);

  const handleDownload = () => {
    if (isPairwiseViz) {
      downloadPNG(downloadFileName, "svgChart", includeURL);
    } else {
      downloadPNG(downloadFileName, "scatter-chart", includeURL);
    }
  };
  console.log("downloadFileName: "+downloadFileName);
  console.log("isPairwiseViz: "+isPairwiseViz);
  

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"right"}
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
        }}
      > 
        <Typography>Download options:</Typography>
        <Tooltip placement="top" title={"Set the width of the output image"}>
          <Box display="flex" alignItems="center">
            <Typography>Width:</Typography>
            <TextField
              inputRef={widthInputRef}
              type="text"
              value={outputImageWidth}
              onChange={handleWidthInputChange}
              size="small"
              variant="standard"
              sx={{
                width: 40,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
              }}
            />
            <Typography>mm</Typography>
          </Box>
        </Tooltip>
        <Tooltip placement="top" title={"Set the resolution of the output image"}>
          <Box display="flex" alignItems="center">
            <Typography>Resolution:</Typography>
            <TextField
              inputRef={dpiInputRef}
              type="text"
              value={dpi}
              onChange={handleDpiInputChange}
              size="small"
              variant="standard"
              sx={{
                width: 40,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
              }}
            />
            <Typography>dpi</Typography>
          </Box>
        </Tooltip>
        <Tooltip placement="top" title={"Change the size of the X and Y axis tick labels"}>
          <Box display="flex" alignItems="center">
            <Typography>Axis labels size:</Typography>
            <TextField
              inputRef={tickInputRef}
              type="number"
              value={tickFontSize}
              onChange={handleInputChange}
              size="small"
              variant="standard"
              sx={{
                width: 60,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
              }}
            />
            <Typography>px</Typography>
          </Box>
        </Tooltip>
        <Tooltip placement="top" title={"Include URL of this visualization in the downloaded image?"}>
          <Button onClick={handleIncludeURL}>
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
        <Button
          onClick={() => handleDownload()}
          color="primary"
          variant="text"
          rel="noreferrer"
          target="_blank"
        >
          Download PNG
        </Button>
      </Box>
    </>
  );
};

export default DownloadPanel;
