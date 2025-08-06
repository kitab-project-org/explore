import { Box } from "@mui/material";
import AlignmentsFilter from "./filters/AlignmentsFilter";
import BookCharsFilter from "./filters/BookCharsFilter";
import DateFilter from "./filters/DateFilter";
import SelfReuseFilter from "./filters/SelfReuseFilter";



const MultiFilter = (props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        marginLeft: "50px",
      }}
    >
      <SelfReuseFilter/>
      <DateFilter
        dateRange={props.dateRange}
        setDateRange={props.setDateRange}
      />
      <AlignmentsFilter
        bookAlignRange={props.bookAlignRange}
        setBookAlignRange={props.setBookAlignRange}
      />
      <BookCharsFilter
        bookCharRange={props.bookCharRange}
        setBookCharRange={props.setBookCharRange}
      />
    </Box>
  );
};

export default MultiFilter;
