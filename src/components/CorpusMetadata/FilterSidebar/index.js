import { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListSubheader,
  Switch,
} from "@mui/material";
import MetaFilters from "./MetaFilters";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"


const FilterSidebar = () => {
  const {
    showFilters,
    analysisPriority, setAnalysisPriority,
    includeManuscripts, setIncludeManuscripts,
    allReleasesInsights,
    releaseCode,
  } = useContext(Context);

  // true only when the selected release has an "mss" subcorpus entry in its
  // CorpusInsights record (e.g. 2025.1.9+); older releases return false so
  // the manuscripts toggle is hidden for them
  const hasManuscripts = allReleasesInsights
    .find(r => r.release_code === releaseCode)
    ?.subcorpora?.includes("MSS") ?? false;

  const [searchParams, setSearchParams] = useSearchParams();

  // toggler for primary-secondary metadata
  const handlePrimaryTextToggle = () => {
    setAnalysisPriority(!analysisPriority);
    // remove the page parameter from the query string
    const params = cleanSearchPagination(searchParams);
    if (!analysisPriority === true) {
      setSearchParams({ ...params, version: "all" });
    } else {
      setSearchParams({ ...params, version: "pri" });
    }
  };

  useEffect(() => {
    if (!analysisPriority) {
      const params = Object.fromEntries([...searchParams]);
      setSearchParams({ ...params, version: "pri" });
    } else {
      if (searchParams.get("version") === "pri") {
        setAnalysisPriority(false);
      } else {
        setAnalysisPriority(true);
      }
    }
  }, [searchParams, setSearchParams, analysisPriority, setAnalysisPriority]);

  return (
    <Box
      sx={{
        //transition: ".3s",
        transition: "transform 0.3s ease-in-out",
        position: {
          xs: "fixed",
          sm: "absolute",
        },
        width: {
          xs: "90%",
          sm: "20%",
        },
        zIndex: "999",
        left: {
          xs: "50%",
          sm: showFilters ? 0 : "-20%",
        },
        /*translate: {
          xs: "-50%",
          sm: "0",
        },*/
        transform: {
          xs: showFilters ? "translateX(0)" : "translateX(-100%)",
          sm: showFilters ? "translateX(0)" : "translateX(-100%)",
        },
        borderRadius: "5px",
        boxShadow: {
          xs: "0px 0px 5px 0px grey",
          sm: "inherit",
        },
        display: {
          xs: showFilters ? "block" : "none",
          sm: "block",
        },
      }}
      bgcolor={"white"}
    >
      <List subheader={<ListSubheader>Filters</ListSubheader>}>
        <ListItem>
          <FormControl component="fieldset" variant="standard" fullWidth>
            <FormLabel
              sx={{
                py: "10px",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.6) !important",
              }}
            >
              Display text versions:
            </FormLabel>
            <Box display={"flex"} flexDirection={"column"} gap={1} mx={2}>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <FormLabel
                  sx={{
                    color: "rgba(0, 0, 0, 0.6) !important",
                  }}
                >
                  Include Secondary Versions
                </FormLabel>
                <Switch
                  size="small"
                  onChange={() => handlePrimaryTextToggle()}
                  checked={analysisPriority}
                  color="pri"
                />
              </Box>

              {/* Only shown for releases that contain manuscript transcriptions */}
              {hasManuscripts && (
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <FormLabel
                    sx={{
                      color: "rgba(0, 0, 0, 0.6) !important",
                    }}
                  >
                    Include Manuscripts
                  </FormLabel>
                  <Switch
                    size="small"
                    onChange={() => setIncludeManuscripts(!includeManuscripts)}
                    checked={includeManuscripts}
                  />
                </Box>
              )}
            </Box>
          </FormControl>
        </ListItem>
        <ListItem>
          <MetaFilters />
        </ListItem>
      </List>
    </Box>
  );
};

export default FilterSidebar;
