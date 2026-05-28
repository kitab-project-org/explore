import RangeSlider from "./RangeSlider";

const MilestoneFilter = ({ fullMilestoneRange, setMsRange, initialValue }) => (
  <RangeSlider title="Milestone range:" fullRange={fullMilestoneRange} setRange={setMsRange} initialValue={initialValue} />
);

export default MilestoneFilter;