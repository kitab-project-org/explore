import {useState} from "react";
import { Box, Slider, Typography } from "@mui/material";

const DateFilter = (props) => {
  const [sliderVal, setSliderVal] = useState(props.dateRange);

  const handleChangeCommitted = (e, newRange) => {
    props.setDateRange(newRange);
  }
  const sliderTitle = "Filter by date:";

  console.log(props.dateRange);
  return (
    <Box 
      sx={{ 
        width: 200,
        margin: "20px"
        }}
    >
      <Typography gutterBottom sx={{textAlign: "center"}}>{sliderTitle}</Typography>
      <Slider
        value={sliderVal}
        onChange={(e, newRange) => setSliderVal(newRange)}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        min={props.dateRange[0]}
        max={props.dateRange[1]}
      />
    </Box>

  )
};

export default DateFilter;