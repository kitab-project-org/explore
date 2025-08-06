import { useState } from "react";
import { Box, Slider, Typography } from "@mui/material";

const BookCharsFilter = (props) => {
  console.log(props);
  const [sliderVal, setSliderVal] = useState(props.bookCharRange);

  const handleChange = (e, newRange) => {
    // change the value of the slider, don't re-render:
    setSliderVal(newRange);
  };
  const handleChangeCommitted = (e, newRange) => {
    props.setBookCharRange(newRange);
  };

  console.log(props.bookCharRange);
  return (
    <Box
      sx={{
        width: 200,
        margin: "20px",
      }}
    >
      <Typography gutterBottom sx={{ textAlign: "center" }}>
        Matched characters per book:
      </Typography>
      <Slider
        value={sliderVal}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        min={0}
        max={props.bookCharRange[1]}
      />
    </Box>
  );
};

export default BookCharsFilter;
