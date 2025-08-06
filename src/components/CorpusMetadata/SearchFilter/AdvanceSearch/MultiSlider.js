import { useState } from "react";
import { Box, Slider, Typography } from "@mui/material";

function valuetext(value) {
  return `${value}°C`;
}

const minDistance = 10;
const maxTokCount = 5000000;

export default function MultiSlider({ min, max, handler, label }) {
  const [value2, setValue2] = useState([
    min ? min : 0,
    max ? max : maxTokCount,
  ]);

  // multi filter selection function
  const handleChange2 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setValue2([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue2([clamped - minDistance, clamped]);
      }
    } else {
      setValue2(newValue);
    }
  };

  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        getAriaLabel={() => "Minimum distance shift"}
        value={value2}
        onChange={handleChange2}
        onChangeCommitted={handler}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        max={maxTokCount}
        disableSwap
      />
    </Box>
  );
}
