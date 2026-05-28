import RangeSlider from "./RangeSlider";

const AlignmentsFilter = ({ fullAlignRange, setBookAlignRange, initialValue }) => (
  <RangeSlider title="Alignments per book:" fullRange={fullAlignRange} setRange={setBookAlignRange} initialValue={initialValue} />
);

export default AlignmentsFilter;