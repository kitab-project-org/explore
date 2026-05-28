import RangeSlider from "./RangeSlider";

const BookCharsFilter = ({ fullBookCharRange, setBookCharRange, initialValue }) => (
  <RangeSlider title="Matched characters per book:" fullRange={fullBookCharRange} setRange={setBookCharRange} initialValue={initialValue} />
);

export default BookCharsFilter;