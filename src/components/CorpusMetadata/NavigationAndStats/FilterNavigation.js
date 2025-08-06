import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"


const FilterNavigation = ({ showFilters }) => {
  const { analysisPriority, setAnalysisPriority } = useContext(Context);
  const [searchParams, setSearchParams] = useSearchParams();
  const [annotationStatus, setAnnotationStatus] = useState([]);

  // reset search params from url
  const handleDeleteSearchParams = (value, field) => {
    if (value === "version") {
      if (searchParams.get("version") === "pri") {
        setAnalysisPriority(true);
        // remove the page parameter from the query string
        const params = cleanSearchPagination(searchParams);
        setSearchParams({ ...params, version: "all" });
      } else {
        setAnalysisPriority(false);
        // remove the page parameter from the query string
        const params = cleanSearchPagination(searchParams);
        setSearchParams({ ...params, version: "pri" });
      }
    }
    if (field === "annotationStatus") {
      let getData = "";
      const filterAnnotationStatus = annotationStatus.filter(
        (item) => item !== value
      );
      filterAnnotationStatus.map((item, i) =>
        filterAnnotationStatus.length - 1 === i
          ? (getData = `${getData + item}`)
          : (getData = `${getData + item},`)
      );
      // remove the page parameter from the query string
      const params = cleanSearchPagination(searchParams);
      if (filterAnnotationStatus.length === 1) {
        searchParams.delete("annotation_status");
        setSearchParams(searchParams);
      } else {
        setSearchParams({ ...params, annotation_status: getData });
      }
    }
  };

  useEffect(() => {
    if (searchParams.has("annotation_status")) {
      const d = searchParams.get("annotation_status").split(",");
      setAnnotationStatus(d);
    } else {
      setAnnotationStatus([]);
    }
  }, [searchParams]);

  const getColored = (data) => {
    if (data === "notYetAnnotated") {
      return "grey";
    } else if (data === "inProgress") {
      return "#2863A5";
    } else if (data === "completed") {
      return "#ea580c";
    } else if (data === "mARkdown") {
      return "green";
    }
  };

  return (
    <Box
      display={showFilters ? "none" : "flex"}
      alignItems={"center"}
      flexWrap={"wrap"}
      mt={3}
      mb={1}
    >
      <Typography
        variant="body1"
        sx={{
          textTransform: "capitalize",
          color: "#333",
          mr: "20px",
          width: {
            xs: "100%",
            sm: "max-content",
          },
          mb: {
            xs: "10px",
            sn: "0px",
          },
        }}
      >
        Filters
      </Typography>
      <Tooltip
        title={
          analysisPriority
            ? "All text versions displayed."
            : "Only one version per text displayed"
        }
      >
        <Button
          onClick={() => handleDeleteSearchParams("version")}
          sx={{
            bgcolor: "#e5e7eb",
            px: "18px",
            borderRadius: "50px",
            py: "5px",
            mr: "10px",
            mb: {
              xs: "10px",
              sn: "0px",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              color: "#333",
            }}
          >
            {analysisPriority ? "All Versions" : "Primary"}{" "}
            <i
              className="fa-solid fa-xmark"
              style={{
                fontSize: "12px",
              }}
            ></i>
          </Typography>
        </Button>
      </Tooltip>
      {annotationStatus &&
        annotationStatus.map(
          (item, i) =>
            item && (
              <Button
                onClick={() =>
                  handleDeleteSearchParams(item, "annotationStatus")
                }
                key={i}
                sx={{
                  bgcolor: getColored(item),
                  "&:hover": {
                    bgcolor: "#333",
                  },
                  px: "18px",
                  borderRadius: "50px",
                  py: "5px",
                  mr: "10px",
                  mb: {
                    xs: "5px",
                    sn: "0px",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "capitalize",
                    color: getColored(item) ? "white" : "#333",
                  }}
                >
                  {item}{" "}
                  <i
                    className="fa-solid fa-xmark"
                    style={{
                      fontSize: "12px",
                      color: getColored(item) ? "white" : "#333",
                    }}
                  ></i>
                </Typography>
              </Button>
            )
        )}
    </Box>
  );
};

export default FilterNavigation;
