import RangeSlider from "./RangeSlider";

const AlignmentsFilter = ({ fullAlignRange, setBookAlignRange }) => (
  <RangeSlider title="Alignments per book:" fullRange={fullAlignRange} setRange={setBookAlignRange} />
);

export default AlignmentsFilter;