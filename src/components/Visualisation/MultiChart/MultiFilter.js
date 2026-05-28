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
        flexWrap: "wrap",
        marginLeft: "50px",
      }}
    >
      <SelfReuseFilter/>
      {props.hasDates && (
        <DateFilter
          fullDateRange={props.fullDateRange}
          setDateRange={props.setDateRange}
          initialValue={props.initialDateRange}
        />
      )}
      <MilestoneFilter
        fullMilestoneRange={props.fullMilestoneRange}
        setMsRange={props.setMsRange}
        initialValue={props.initialMsRange}
        filterBooksToMsRange={props.filterBooksToMsRange}
        setFilterBooksToMsRange={props.setFilterBooksToMsRange}
      />
      <AlignmentsFilter
        fullAlignRange={props.fullAlignRange}
        setBookAlignRange={props.setBookAlignRange}
        initialValue={props.initialAlignRange}
      />
      <BookCharsFilter
        fullBookCharRange={props.fullBookCharRange}
        setBookCharRange={props.setBookCharRange}
        initialValue={props.initialBookCharRange}
      />
    </Box>
  );
};

export default MultiFilter;