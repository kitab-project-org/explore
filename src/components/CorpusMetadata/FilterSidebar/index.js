import { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Drawer,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListSubheader,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MetaFilters from "./MetaFilters";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"



const FilterSidebar = () => {
  const {
    showFilters, setFilterPanel,
    analysisPriority, setAnalysisPriority,
    includeManuscripts, setIncludeManuscripts,
    activeLanguages, setActiveLanguages,
    allReleasesInsights,
    releaseCode,
  } = useContext(Context);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const content = (
    <List subheader={<ListSubheader>Filters</ListSubheader>}>
      <ListItem sx={{ px: 1 }}>
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
          <Box display={"flex"} flexDirection={"column"} gap={1} ml={1}>
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
              <Box display={"flex"} flexDirection={"column"} gap={1} ml={1}>
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
      <ListItem sx={{ px: 1 }}>
        <MetaFilters />
      </ListItem>
    </List>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={showFilters}
        onClose={() => setFilterPanel(false)}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: "85vw" }} bgcolor="white">
          {content}
        </Box>
      </Drawer>
    );
  }

  return showFilters ? (
    <Box
      sx={{
        width: "20%",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
      }}
      bgcolor={"white"}
    >
      {content}
    </Box>
  ) : null;
};

export default FilterSidebar;
