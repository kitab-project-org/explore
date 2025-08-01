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
      <Tooltip placement="top" title="Change the size of the X and Y axis tick labels">
        <FormControl size="small">
          <TextField
            label="Axis labels size (px)"
            type="text"
            value={tickFontSize}
            onChange={(e) => setTickFontSize(e.target.value)}
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