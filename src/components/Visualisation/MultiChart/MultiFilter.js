import { Box } from "@mui/material";
import AlignmentsFilter from "./filters/AlignmentsFilter";
import BookCharsFilter from "./filters/BookCharsFilter";
import DateFilter from "./filters/DateFilter";
import MilestoneFilter from "./filters/MilestoneFilter";
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
      {props.hasDates && (
        <DateFilter
          fullDateRange={props.fullDateRange}
          setDateRange={props.setDateRange}
        />
      )}
      <MilestoneFilter
        fullMilestoneRange={props.fullMilestoneRange}
        setMsRange={props.setMsRange}
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
