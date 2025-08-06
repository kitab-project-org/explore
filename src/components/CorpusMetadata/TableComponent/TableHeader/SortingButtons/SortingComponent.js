import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { Context } from "../../../../../App";
import { cleanSearchPagination } from "../../../../../utility/Helper"

const SortingComponent = ({ ascending, descending }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setOrderingOrder, sortingOrder } = useContext(Context);

  // get sort values
  const getSortValue = () => {
    if (sortingOrder === ascending) {
      return descending;
    } else if (sortingOrder === descending) {
      return ascending;
    } else {
      return ascending;
    }
  };

  // handle sort filter values
  const handleSortingFilter = (value) => {
    setOrderingOrder(value);
    // remove the page parameter from the query string
    const params = cleanSearchPagination(searchParams);
    setSearchParams({ ...params, ordering: value });
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ cursor: "pointer" }}
      onClick={() => handleSortingFilter(getSortValue())}
    >
      <ArrowDropUp
        sx={{
          mb: "-8px",
          color: sortingOrder === ascending ? "greenyellow" : "white",
        }}
      />
      <ArrowDropDown
        sx={{
          mt: "-8px",
          color: sortingOrder === descending ? "greenyellow" : "white",
        }}
      />
    </Box>
  );
};

export default SortingComponent;
