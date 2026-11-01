import { Box } from "@mui/material";
import RangeSlider from "./RangeSlider";
import SelfReuseFilter from "./SelfReuseFilter";

const DateFilter = ({ fullDateRange, setDateRange, initialValue }) => (
  <Box>
    <RangeSlider id="date-filter" title="Filter by date:" fullRange={fullDateRange} setRange={setDateRange} initialValue={initialValue} />
    <SelfReuseFilter />
  </Box>
);

export default DateFilter;
