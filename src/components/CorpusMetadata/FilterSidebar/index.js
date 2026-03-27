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
  Tooltip,
} from "@mui/material";
import MetaFilters from "./MetaFilters";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"



const FilterSidebar = () => {
  const {
    showFilters,
    analysisPriority, setAnalysisPriority,
    includeManuscripts, setIncludeManuscripts,
    activeLanguages, setActiveLanguages,
    allReleasesInsights,
    releaseCode,
  } = useContext(Context);

  const releaseInsights = allReleasesInsights.find(r => r.release_code === releaseCode);
  // true when the selected release has manuscript versions (2025.1.9+)
  const hasManuscripts = releaseInsights?.has_manuscripts ?? false;
  // dict of language codes → labels present in the release; empty for older releases
  const releaseLanguages = releaseInsights?.languages ?? {};

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

  // toggle a single language code on/off; when all are active (activeLanguages=[])
  // and one is toggled off, populate the list with all codes except that one
  const handleLanguageToggle = (code) => {
    if (activeLanguages.length === 0) {
      setActiveLanguages(Object.keys(releaseLanguages).filter(l => l !== code));
    } else {
      setActiveLanguages(prev =>
        prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
      );
    }
  };

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
                />
              </Box>

              {/* Only shown for releases that contain manuscript versions */}
              {hasManuscripts && (
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <FormLabel sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>
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

            {/* One toggle per language; only shown when the release has
                more than one language; label = code, tooltip = full name */}
            {Object.keys(releaseLanguages).length > 1 && (
              <>
                <FormLabel
                  sx={{
                    py: "10px",
                    fontWeight: "600",
                    color: "rgba(0, 0, 0, 0.6) !important",
                  }}
                >
                  Languages:
                </FormLabel>
                <Box display={"flex"} flexDirection={"column"} gap={1} mx={2}>
                  {Object.entries(releaseLanguages).map(([code, label]) => (
                    <Box
                      key={code}
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Tooltip title={label} placement="right" arrow>
                        <FormLabel sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>
                          {code}
                        </FormLabel>
                      </Tooltip>
                      <Switch
                        size="small"
                        onChange={() => handleLanguageToggle(code)}
                        checked={activeLanguages.length === 0 || activeLanguages.includes(code)}
                      />
                    </Box>
                  ))}
                </Box>
              </>
            )}
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
