import RangeSlider from "./RangeSlider";

const BookCharsFilter = ({ fullBookCharRange, setBookCharRange }) => (
  <RangeSlider title="Matched characters per book:" fullRange={fullBookCharRange} setRange={setBookCharRange} />
);

export default BookCharsFilter;