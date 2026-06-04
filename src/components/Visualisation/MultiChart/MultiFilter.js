import { Box } from "@mui/material";
import AlignmentsFilter from "./filters/AlignmentsFilter";
import BookCharsFilter from "./filters/BookCharsFilter";
import DateFilter from "./filters/DateFilter";
import MilestoneFilter from "./filters/MilestoneFilter";
import StatMetricFilter from "./filters/StatMetricFilter";



const MultiFilter = (props) => {
  return (
    <Box
      id="multi-filter"
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: "50px",
      }}
    >
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
      <StatMetricFilter
        statMetric={props.statMetric}
        setStatMetric={props.setStatMetric}
      />
    </Box>
  );
};

export default MultiFilter;