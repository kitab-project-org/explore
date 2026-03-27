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
  // dict of language codes → labels present in the current release
  const releaseLanguages = releaseInsights?.languages ?? {};
  // union of all language codes → labels across every release; used to show
  // a consistent set of toggles regardless of which release is selected
  const allLanguages = allReleasesInsights.reduce(
    (acc, r) => ({ ...acc, ...(r.languages ?? {}) }),
    {}
  );

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
    setActiveLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
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

              {/* Greyed out for releases that do not contain manuscript versions */}
              <Tooltip
                title={!hasManuscripts ? "This release does not contain manuscripts" : ""}
                placement="right"
                arrow
              >
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <FormLabel
                    sx={{
                      color: hasManuscripts
                        ? "rgba(0, 0, 0, 0.6) !important"
                        : "rgba(0, 0, 0, 0.3) !important",
                    }}
                  >
                    Include Manuscripts
                  </FormLabel>
                  <Switch
                    size="small"
                    onChange={() => setIncludeManuscripts(!includeManuscripts)}
                    checked={includeManuscripts}
                    disabled={!hasManuscripts}
                  />
                </Box>
              </Tooltip>
            </Box>

            {/* One toggle per language known across all releases; greyed out
                if the language is not present in the currently selected release */}
            {Object.keys(allLanguages).length > 0 && (
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
                  {/* Master toggle: resets to all languages when clicked */}
                  <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                    <FormLabel sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>
                      All languages
                    </FormLabel>
                    <Switch
                      size="small"
                      checked={activeLanguages.length === 0}
                      onChange={() => setActiveLanguages([])}
                    />
                  </Box>
                  {Object.entries(allLanguages).map(([code, label]) => {
                    const inRelease = code in releaseLanguages;
                    return (
                      <Tooltip
                        key={code}
                        title={!inRelease ? `This release does not contain ${label} texts` : label}
                        placement="right"
                        arrow
                      >
                        <Box
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                        >
                          <FormLabel
                            sx={{
                              color: inRelease
                                ? "rgba(0, 0, 0, 0.6) !important"
                                : "rgba(0, 0, 0, 0.3) !important",
                            }}
                          >
                            {code}
                          </FormLabel>
                          <Switch
                            size="small"
                            onChange={() => handleLanguageToggle(code)}
                            checked={inRelease && activeLanguages.includes(code)}
                            disabled={!inRelease}
                          />
                        </Box>
                      </Tooltip>
                    );
                  })}
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
