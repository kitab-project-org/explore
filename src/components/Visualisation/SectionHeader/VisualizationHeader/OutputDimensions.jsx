import { useContext } from "react";
import {
  FormControl,
  //InputLabel,
  TextField,
  Box,
  Tooltip,
} from "@mui/material";
import { Context } from "../../../../App";


const OutputDimensions = () => {
  const { 
    tickFontSize, 
    setTickFontSize,
    axisLabelFontSize,
    setAxisLabelFontSize,
    outputImageWidth,
    setOutputImageWidth,
    dpi, 
    setDpi
  } = useContext(Context); 

  return (
    <Box display="flex" gap={2} alignItems="center">
      <Tooltip placement="top" title="Set the width of the output image (in millimeters)">
        <FormControl size="small">
          <TextField
            label="Width (mm)"
            type="text"
            value={outputImageWidth}
            onChange={(e) => setOutputImageWidth(e.target.value)}
            sx={{ 
                width: 100,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
          />
        </FormControl>
      </Tooltip>
      <Tooltip placement="top" title="Set the resolution of the output image (dots per inch)">
        <FormControl size="small">
          <TextField
            label="Resolution (dpi)"
            type="text"
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            sx={{ 
                width: 120,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
          />
        </FormControl>
      </Tooltip>
      <Tooltip placement="top" title="Change the size of the numeric tick labels on the X and Y axes">
        <FormControl size="small">
          <TextField
            label="Tick label size (px)"
            type="text"
            value={tickFontSize || ""}
            onChange={(e) => setTickFontSize(parseInt(e.target.value) || 0)}
            sx={{ 
                width: 120,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
          />
        </FormControl>
      </Tooltip>
      <Tooltip placement="top" title="Change the size of the graph's labels">
        <FormControl size="small">
          <TextField
            label="Axis label size (px)"
            type="text"
            value={axisLabelFontSize || ""}
            onChange={(e) => setAxisLabelFontSize(parseInt(e.target.value) || 0)}
            sx={{ 
                width: 120,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
          />
        </FormControl>
      </Tooltip>
    </Box>
  );
};

export default OutputDimensions;