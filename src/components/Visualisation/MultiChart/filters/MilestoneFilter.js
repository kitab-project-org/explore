import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import RangeSlider from "./RangeSlider";

const MilestoneFilter = ({ fullMilestoneRange, setMsRange, initialValue, filterBooksToMsRange, setFilterBooksToMsRange }) => (
  <Box id="milestone-filter">
    <RangeSlider title="Milestone range:" fullRange={fullMilestoneRange} setRange={setMsRange} initialValue={initialValue} />
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={filterBooksToMsRange ?? false}
          onChange={(e) => setFilterBooksToMsRange?.(e.target.checked)}
        />
      }
      label={<Typography variant="body2">Hide books with no matches in range</Typography>}
      sx={{ px: "20px", display: "flex", mt: "-30px" }}
    />
  </Box>
);

export default MilestoneFilter;