import RangeSlider from "./RangeSlider";

const DateFilter = ({ fullDateRange, setDateRange, initialValue }) => (
  <RangeSlider title="Filter by date:" fullRange={fullDateRange} setRange={setDateRange} initialValue={initialValue} />
);

export default DateFilter;