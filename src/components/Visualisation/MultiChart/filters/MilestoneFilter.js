import { useState, useEffect } from "react";
import { Box, Button, Slider, TextField, Typography } from "@mui/material";

const noSpinnerSx = {
  width: "90px",
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { display: "none" },
  "& input[type=number]": { MozAppearance: "textfield" },
};

const MilestoneFilter = ({ setMsRange, fullMilestoneRange }) => {
  const [sliderVal, setSliderVal] = useState(fullMilestoneRange);
  // textVal holds the raw string while the user is typing:
  const [textVal, setTextVal] = useState(fullMilestoneRange.map(String));

  // Sync when a new book's data is loaded:
  useEffect(() => {
    setSliderVal(fullMilestoneRange);
    setTextVal(fullMilestoneRange.map(String));
    setMsRange(fullMilestoneRange);
  }, [fullMilestoneRange[0], fullMilestoneRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (index, raw) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      setTextVal(prev => { const n = [...prev]; n[index] = String(sliderVal[index]); return n; });
      return;
    }
    const clamped = index === 0
      ? Math.min(Math.max(num, fullMilestoneRange[0]), sliderVal[1])
      : Math.min(Math.max(num, sliderVal[0]), fullMilestoneRange[1]);
    const next = index === 0 ? [clamped, sliderVal[1]] : [sliderVal[0], clamped];
    setSliderVal(next);
    setTextVal(next.map(String));
    setMsRange(next);
  };

  const handleReset = () => {
    setSliderVal(fullMilestoneRange);
    setTextVal(fullMilestoneRange.map(String));
    setMsRange(fullMilestoneRange);
  };

  return (
    <Box sx={{ width: 200, margin: "20px" }}>
      <Typography gutterBottom sx={{ textAlign: "center" }}>Milestone range:</Typography>
      <Slider
        value={sliderVal}
        onChange={(_, newRange) => { setSliderVal(newRange); setTextVal(newRange.map(String)); }}
        onChangeCommitted={(_, newRange) => setMsRange(newRange)}
        min={fullMilestoneRange[0]}
        max={fullMilestoneRange[1]}
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
          inputProps={{ min: fullMilestoneRange[0], max: sliderVal[1], step: 1 }}
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
          inputProps={{ min: sliderVal[0], max: fullMilestoneRange[1], step: 1 }}
          sx={noSpinnerSx}
        />
      </Box>
      <Button size="small" onClick={handleReset} sx={{ mt: 1, width: "100%" }}>
        Reset
      </Button>
    </Box>
  );
};

export default MilestoneFilter;