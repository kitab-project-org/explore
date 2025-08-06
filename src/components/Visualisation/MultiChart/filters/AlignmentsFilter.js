import {useState} from "react";
import { Box, Slider, Typography } from "@mui/material";


const AlignmentsFilter = (props) => {
  //console.log(props);
  const [sliderVal, setSliderVal] = useState(props.bookAlignRange);

  const handleChange = (e, newRange) => {
    // change the value of the slider, don't re-render:
    setSliderVal(newRange);
  }
  const handleChangeCommitted = (e, newRange) => {
    //console.log(props.setBookAlignRange);
    props.setBookAlignRange(newRange);
  }

  //console.log(props.bookAlignRange);
  return (
    <Box 
      sx={{ 
        width: 200,
        margin: "20px"
        }}
    >
      <Typography 
        gutterBottom 
        sx={{textAlign: "center"}}
      >
        Alignments per book:
      </Typography>
      <Slider
        value={sliderVal}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        min={0}
        max={props.bookAlignRange[1]}
      />
    </Box>

  )
};

export default AlignmentsFilter;