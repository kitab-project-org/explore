import { useEffect, useCallback, useContext } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"; // CHECK: Should this be imported from @mui/material?
import { makeStyles } from "@mui/styles";
import { getCorpusMetaData } from "../../services/CorpusMetaData";
import FilterSidebar from "./FilterSidebar";
import TableComponent from "./TableComponent";
import CorpusHeader from "./CorpusHeader";
import NavigationAndStats from "./NavigationAndStats";
import SearchFilters from "./SearchFilter";
import PaginationComponent from "../Common/PaginationComponent";
import { Context } from "../../App";

// make custom style for material ui component
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  tableHeaderCell: {
    fontSize: 14,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    textAlign: "right",
  },
  tableCell: {
    textAlign: "right",
    verticalAlign: "top",
  },
  gridContainer: {
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
    [theme.breakpoints.up("sm")]: {
      padding: "0px 100px",
    },
  },
}));

const MetadataTable = ({ isHome }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { version } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    rows,
    setRows,
    releaseCode,
    setReleaseCode,
    setStatus,
    query,
    setQuery,
    searchField,
    normalizedSearch,
    setNormalizedSearch,
    sortingOrder,
    setOrderingOrder,
    analysisPriority,
    setAnalysisPriority,
    annotationFilter,
    setAnnotationFilter,
    totalRecords,
    setTotal,
    checkedNotification,
    setCheckedNotification,
    showFilters,
    advanceSearch,
    setAdvanceSearch,
    setBooks,
    setBooksAlignment
  } = useContext(Context);

  
  // reset the books and booksAlignment variables,
  // so that when moving from the visualisation page to the 
  // metadata page, the visualisation data is forgotten;
  // otherwise, the wrong data may be passed to visualization
  // when moving from metadata to visualisation again.
  // NB: This effect runs only once, on mounting of the metadata page.
  useEffect(() => {
    console.log("resetting books variable");
    setBooks({});
    setBooksAlignment({
      // alignment strings:
      s1: "",
      s2: "",
      // part of the milestones before the alignment:
      beforeAlignment1: "",
      beforeAlignment2: "",
      // part of the milestones after the alignment:
      afterAlignment1: "",
      afterAlignment2: "",
      // token (*w*ord) offset of *b*eginning and *e*nd of the alignment:
      bw1: 0,
      ew1: 0,
      bw2: 0,
      ew2: 0,
      // *c*haracter offset of *b*eginning and *e*nd of the alignment:
      bc1: 0,
      ec1: 0,
      bc2: 0,
      ec2: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update orders
  const updateOrderingOrder = useCallback(() => {
    if (searchParams.has("ordering")) {
      setOrderingOrder(searchParams.get("ordering"));
    } else {
      setOrderingOrder("");
    }
  }, [searchParams, setOrderingOrder]);

  useEffect(() => {
    updateOrderingOrder();
  }, [updateOrderingOrder]);

  const updatePage = useCallback(() => {
    if (searchParams.has("page")) {
      setPage(parseInt(searchParams.get("page")));
    } else {
      setPage(1);
    }
  }, [searchParams, setPage]);

  useEffect(() => {
    updatePage();
  }, [updatePage]);

  const updatePageRow = useCallback(() => {
    if (searchParams.has("rowsPerPage")) {
      setRowsPerPage(parseInt(searchParams.get("rowsPerPage")));
    } else {
      setRowsPerPage(10);
    }
  }, [searchParams, setRowsPerPage]);

  useEffect(() => {
    updatePageRow();
  }, [updatePageRow]);

  // function for reset filters
  const handleResetFilters = () => {
    setQuery("");
    setOrderingOrder("");
    setOrderingOrder("");
    setAnalysisPriority(true);
    setPage(1);
    setNormalizedSearch(true);
    setRowsPerPage(10);
    setAnnotationFilter({
      completed: false,
      inProgress: false,
      mARkdown: false,
      notYetAnnotated: false,
    });
    setSearchParams({ version: "all" });
    setAdvanceSearch({
      // max_char_count: "",
      // min_char_count: "",
      max_tok_count: "",
      min_tok_count: "",
      editor: "",
      edition_place: "",
      edition_date: "",
      died_before_AH: "",
      died_after_AH: "",
    });
  };

  useEffect(() => {
    if (searchParams.get("search")) {
      setQuery(searchParams.get("search"));
    }
  }, [searchParams, setQuery]);

  useEffect(() => {
    if (version) {
      setReleaseCode(version);
      localStorage.setItem("release_code", JSON.stringify(version));
    } else {
      const storedReleaseCode = localStorage.getItem("release_code");
      if (storedReleaseCode) {
        setReleaseCode(JSON.parse(storedReleaseCode));
      } else {
        setReleaseCode(releaseCode);
        localStorage.setItem("release_code", JSON.stringify(releaseCode));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isChecked = (value) => {
      if (searchParams.get("annotation_status")) {
        const annotationStatusArr = searchParams
          .get("annotation_status")
          .split(",");
        const isExist = annotationStatusArr.filter((item) => {
          return item === value;
        });
        if (isExist.length !== 1) {
          return false;
        } else {
          return true;
        }
      }
    };

    setAnnotationFilter({
      notYetAnnotated: searchParams.get("annotation_status")
        ? isChecked("notYetAnnotated")
        : false,
      inProgress: searchParams.get("annotation_status")
        ? isChecked("inProgress")
        : false,
      completed: searchParams.get("annotation_status")
        ? isChecked("completed")
        : false,
      mARkdown: searchParams.get("annotation_status")
        ? isChecked("mARkdown")
        : false,
    });
  }, [searchParams, setAnnotationFilter]);

  useEffect(() => {
    setStatus("loading");
    const getData = async () => {
      const data = await getCorpusMetaData(
        page,
        rowsPerPage,
        query,
        searchField,
        normalizedSearch,
        annotationFilter,
        sortingOrder,
        analysisPriority,
        releaseCode,
        advanceSearch
      );
      setRows(data.results);
      setStatus("loaded");
      setTotal(data.count);
    };

    getData();
  }, [
    page,
    rowsPerPage,
    query,
    searchField,
    normalizedSearch,
    annotationFilter,
    sortingOrder,
    analysisPriority,
    releaseCode,
    checkedNotification,
    setCheckedNotification,
    setRows,
    setStatus,
    setTotal,
    advanceSearch,
  ]);
  useEffect(() => {
    if (!isHome) {
      navigate(`/metadata/${releaseCode}/${location.search}`);
    } else {
      navigate(`/${releaseCode}/${location.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseCode]);

  return (
    <>
      <Grid container className={classes.gridContainer}>
        <CorpusHeader />

        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"right"}
          overflow={"hidden"}
          position={"relative"}
        >
          <FilterSidebar />

          <Box
            sx={{
              transition: ".3s",
              float: "right",
              width: {
                xs: "100%",
                sm: showFilters ? "80%" : "100%",
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                overflow: "hidden",
                minHeight: "400px",
              }}
            >
              <Grid>
                <SearchFilters
                  handleResetFilters={handleResetFilters}
                  getQuery={(q) => {
                    setQuery(q);
                  }}
                />

                <NavigationAndStats />

                {rows ? (
                  <TableComponent classes={classes} />
                ) : (
                  <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    minHeight={"300px"}
                  >
                    <Typography variant="h4">No Data Found</Typography>
                  </Box>
                )}

                {totalRecords ? <PaginationComponent /> : ""}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Grid>
    </>
  );
};
export default MetadataTable;
