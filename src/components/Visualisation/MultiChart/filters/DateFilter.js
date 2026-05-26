import RangeSlider from "./RangeSlider";

const DateFilter = ({ fullDateRange, setDateRange }) => (
  <RangeSlider title="Filter by date:" fullRange={fullDateRange} setRange={setDateRange} />
);

export default DateFilter;