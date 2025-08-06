import { useState } from "react";
import { Typography, Box, Slider } from "@mui/material";

export default function SingleSlider({ max, handler, label, value }) {
  const [value2, setValue2] = useState(value ? value : 0);

  // set slider value
  const handleChange2 = (event, newValue) => {
    setValue2(newValue);
  };

  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        value={value2}
        defaultValue={value}
        onChange={handleChange2}
        onChangeCommitted={handler}
        valueLabelDisplay="auto"
        max={max}
      />
    </Box>
  );
}
