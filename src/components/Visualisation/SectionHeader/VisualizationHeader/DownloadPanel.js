import { useContext, useEffect } from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import * as d3 from "d3";
import IncludeMetaDropdown from "./IncludeMetaDropdown";
import OutputDimensions from "./OutputDimensions";
import { Context } from "../../../../App";


const DownloadPanel = ( {isPairwiseViz, downloadFileName} ) => {
  const { 
    downloadPNG, 
    tickFontSize, 
    includeURL,
    setIncludeURL
  } = useContext(Context);
  
  const svgSelector = isPairwiseViz ? 'svgChart' : 'scatterChart';

  const handleIncludeUrlChange = (e) => {
    setIncludeURL((prev) => !prev);
  }

  // Apply font size when it changes
    useEffect(() => {
      // TODO: fix the font size for one-to-many chart!
      console.log("Updating font size");
      d3.selectAll(`#chartBox .tick text`).style("font-size", `${tickFontSize}px`);
      /*const selectors = [`#chartBox`, ".bottom-bar", ".side-bar"];
      selectors.map((item) => {
        console.log(item); 
        d3.selectAll(`${item} .tick text`).style("font-size", `${tickFontSize}px`);
      })*/
    }, [tickFontSize]);


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
          padding: "5px"
        }}
      > 
        <Typography sx={{ fontWeight: 'bold' }}>Download options:</Typography>
        <OutputDimensions/>
        <IncludeMetaDropdown/>
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
        <Button
          onClick={() => downloadPNG(downloadFileName, svgSelector, includeURL)}
          color="primary"
          variant="outlined"
          rel="noreferrer"
          target="_blank"
          style={{textTransform: 'none'}}
        >
          Download PNG
        </Button>
      </Box>
    </>
  );
};

export default DownloadPanel;
