import RangeSlider from "./RangeSlider";

const AlignmentsFilter = ({ fullAlignRange, setBookAlignRange, initialValue }) => (
  <RangeSlider id="alignments-filter" title="Alignments per book:" fullRange={fullAlignRange} setRange={setBookAlignRange} initialValue={initialValue} />
);

export default AlignmentsFilter;