import { useState, useEffect, useRef } from "react";
import { Box, Button, Slider, TextField, Typography } from "@mui/material";

const noSpinnerSx = {
  width: "90px",
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { display: "none" },
  "& input[type=number]": { MozAppearance: "textfield" },
};

const RangeSlider = ({ title, fullRange, setRange, initialValue }) => {
  const init = initialValue ?? fullRange;
  const [sliderVal, setSliderVal] = useState(init);
  const [textVal, setTextVal] = useState(init.map(String));

  // Reset when a new book's data is loaded (skip on initial mount — the slider
  // is already initialised to the correct value via useState above):
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    setSliderVal(fullRange);
    setTextVal(fullRange.map(String));
    setRange(fullRange);
  }, [fullRange[0], fullRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (index, raw) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      setTextVal(prev => { const n = [...prev]; n[index] = String(sliderVal[index]); return n; });
      return;
    }
    const clamped = index === 0
      ? Math.min(Math.max(num, fullRange[0]), sliderVal[1])
      : Math.min(Math.max(num, sliderVal[0]), fullRange[1]);
    const next = index === 0 ? [clamped, sliderVal[1]] : [sliderVal[0], clamped];
    setSliderVal(next);
    setTextVal(next.map(String));
    setRange(next);
  };

  const handleReset = () => {
    setSliderVal(fullRange);
    setTextVal(fullRange.map(String));
    setRange(fullRange);
  };

  return (
    <Box sx={{ width: 200, margin: "20px" }}>
      <Typography gutterBottom sx={{ textAlign: "center" }}>{title}</Typography>
      <Slider
        value={sliderVal}
        onChange={(_, newRange) => { setSliderVal(newRange); setTextVal(newRange.map(String)); }}
        onChangeCommitted={(_, newRange) => setRange(newRange)}
        min={fullRange[0]}
        max={fullRange[1]}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 1 }}>
        <TextField
          size="small"
          type="number"
          label="From"
          value={textVal[0]}
          onChange={(e) => setTextVal(prev => [e.target.value, prev[1]])}
          onBlur={(e) => commit(0, e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(0, e.target.value); }}
          inputProps={{ min: fullRange[0], max: sliderVal[1], step: 1 }}
          sx={noSpinnerSx}
        />
        <TextField
          size="small"
          type="number"
          label="To"
          value={textVal[1]}
          onChange={(e) => setTextVal(prev => [prev[0], e.target.value])}
          onBlur={(e) => commit(1, e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(1, e.target.value); }}
          inputProps={{ min: sliderVal[0], max: fullRange[1], step: 1 }}
          sx={noSpinnerSx}
        />
      </Box>
      <Button size="small" onClick={handleReset} sx={{ mt: 1, width: "100%" }}>
        Reset
      </Button>
    </Box>
  );
};

export default RangeSlider;