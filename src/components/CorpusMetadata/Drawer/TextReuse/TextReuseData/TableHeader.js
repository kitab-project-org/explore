import { Box } from "@mui/material";
import { Typography } from "@mui/material";
import SortingComponent from "./SortingComponent";

const TableHeader = ({ sortingOrder, setSortingOrder }) => {
  return (
    <Box
      id="TextReuseData-TableHeader"
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        margin: "5px 0px",
        padding: "8px 0px",
        bgcolor: "#7593af",
        color: "white",
        borderRadius: "5px",
        borderBottomLeftRadius: "0px",
        borderBottomRightRadius: "0px",
        float: "left",
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        width={"70%"}
        padding={"0px 15px"}
      >
        Work
        <SortingComponent
          ascending={"book"}
          descending={"-book"}
          sortingOrder={sortingOrder}
          setSortingOrder={setSortingOrder}
        />
      </Box>

      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"20%"}
        padding={"0px 15px"}
      >
        Records #
        <SortingComponent
          ascending={"instances_count"}
          descending={"-instances_count"}
          sortingOrder={sortingOrder}
          setSortingOrder={setSortingOrder}
        />
      </Box>
      <Typography id="reuse-actions-header" width={"20%"} padding={"0px 15px"}>Actions</Typography>
    </Box>
  );
};

export default TableHeader;
