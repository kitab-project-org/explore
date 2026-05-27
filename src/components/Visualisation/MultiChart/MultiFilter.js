import { Box } from "@mui/material";
import AlignmentsFilter from "./filters/AlignmentsFilter";
import BookCharsFilter from "./filters/BookCharsFilter";
import DateFilter from "./filters/DateFilter";
import MilestoneFilter from "./filters/MilestoneFilter";
import SelfReuseFilter from "./filters/SelfReuseFilter";
import TocFilter from "./filters/TocFilter";



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
        />
      )}
      <MilestoneFilter
        fullMilestoneRange={props.fullMilestoneRange}
        setMsRange={props.setMsRange}
      />
      <AlignmentsFilter
        fullAlignRange={props.fullAlignRange}
        setBookAlignRange={props.setBookAlignRange}
      />
      <BookCharsFilter
        fullBookCharRange={props.fullBookCharRange}
        setBookCharRange={props.setBookCharRange}
      />
      <TocFilter
        toc={props.toc}
        selectedSectionIds={props.selectedSectionIds}
        setSelectedSectionIds={props.setSelectedSectionIds}
      />
    </Box>
  );
};

export default MultiFilter;