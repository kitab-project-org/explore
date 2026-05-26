import RangeSlider from "./RangeSlider";

const MilestoneFilter = ({ fullMilestoneRange, setMsRange }) => (
  <RangeSlider title="Milestone range:" fullRange={fullMilestoneRange} setRange={setMsRange} />
);

export default MilestoneFilter;