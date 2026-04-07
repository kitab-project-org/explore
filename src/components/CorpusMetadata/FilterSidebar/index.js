import { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListSubheader,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import CloseIcon from "@mui/icons-material/Close";
import MetaFilters from "./MetaFilters";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper";



const FilterSidebar = ({ handleResetFilters }) => {
  const {
    showFilters, setFilterPanel,
    showPrimary, setShowPrimary,
    showSecondary, setShowSecondary,
    activeTextTypes, setActiveTextTypes,
    activeLanguages, setActiveLanguages,
    allReleasesInsights,
    releaseCode,
  } = useContext(Context);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Build a raw query string without percent-encoding commas in values, then navigate to it.
  // setSearchParams goes through URLSearchParams which encodes commas as %2C.
  const navigateRaw = (params) => {
    const qs = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${v}`).join("&");
    navigate({ search: `?${qs}` });
  };

  const releaseInsights = allReleasesInsights.find(r => r.release_code === releaseCode);
  const hasManuscripts = releaseInsights?.has_manuscripts ?? false;
  // dict of language codes → labels present in the current release
  const releaseLanguages = releaseInsights?.languages ?? {};
  // union of all language codes → labels across every release; used to show
  // a consistent set of toggles regardless of which release is selected
  const allLanguages = allReleasesInsights.reduce(
    (acc, r) => ({ ...acc, ...(r.languages ?? {}) }),
    {}
  );

  // --- URL param helpers ---
  const setVersionParam = (primary, secondary) => {
    const params = cleanSearchPagination(searchParams);
    if (primary && secondary) setSearchParams({ ...params, version: 'all' });
    else if (!primary && secondary) setSearchParams({ ...params, version: 'sec' });
    else if (!primary && !secondary) setSearchParams({ ...params, version: 'none' });
    else setSearchParams({ ...params, version: 'pri' });
  };

  const setTextTypeParam = (newTypes) => {
    const params = cleanSearchPagination(searchParams);
    navigateRaw({ ...params, text_type: newTypes.length === 0 ? 'all' : newTypes.join(',') });
  };

  const setLanguageParam = (newLangs) => {
    const params = cleanSearchPagination(searchParams);
    navigateRaw({ ...params, language: newLangs.length === 0 ? 'all' : newLangs.join(',') });
  };

  // --- Toggle handlers ---
  const handleTextTypeToggle = (type) => {
    const newTypes = activeTextTypes.includes(type)
      ? activeTextTypes.filter(t => t !== type)
      : [...activeTextTypes, type];
    setActiveTextTypes(newTypes);
    setTextTypeParam(newTypes);
  };

  // toggle a single language code on/off
  const handleLanguageToggle = (code) => {
    const newLangs = activeLanguages.includes(code)
      ? activeLanguages.filter(l => l !== code)
      : [...activeLanguages, code];
    setActiveLanguages(newLangs);
    setLanguageParam(newLangs);
  };

  const content = (
    <List subheader={
      <ListSubheader sx={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", pr: 0 }}>
        Filters
        <Box display="flex" alignItems="center">
          {(searchParams.size > 3 ||
            (searchParams.get("version") && searchParams.get("version") !== "pri") ||
            (searchParams.get("text_type") && searchParams.get("text_type") !== "all") ||
            (searchParams.get("language") && searchParams.get("language") !== "all")) && (
            <Tooltip title="Clear filters">
              <IconButton size="small" onClick={handleResetFilters}>
                <FilterAltOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close filters">
            <IconButton size="small" onClick={() => setFilterPanel(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListSubheader>
    }>
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
            {[
              { label: "Primary",   checked: showPrimary,   onChange: () => { const n = !showPrimary;   setShowPrimary(n);   setVersionParam(n, showSecondary); } },
              { label: "Secondary", checked: showSecondary, onChange: () => { const n = !showSecondary; setShowSecondary(n); setVersionParam(showPrimary, n); } },
            ].map(({ label, checked, onChange }) => (
              <Box key={label} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <FormLabel sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>{label}</FormLabel>
                <Switch size="small" checked={checked} onChange={onChange} />
              </Box>
            ))}
          </Box>

          <FormLabel
            sx={{
              py: "10px",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.6) !important",
            }}
          >
            Texts by type:
          </FormLabel>
          <Box display={"flex"} flexDirection={"column"} gap={1} ml={1}>
            {[
              { key: null,           label: "All" },
              { key: "manuscripts",  label: "Manuscripts",     disabled: !hasManuscripts, tooltip: !hasManuscripts ? "This release does not contain manuscripts" : "" },
              { key: "ocr",          label: "Uncorrected OCR", disabled: false, tooltip: "" },
              { key: "other",        label: "Other",           disabled: false, tooltip: "" },
            ].map(({ key, label, disabled, tooltip }) => (
              <Tooltip key={label} title={tooltip} placement="right" arrow>
                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                  <FormLabel sx={{ color: disabled ? "rgba(0, 0, 0, 0.3) !important" : "rgba(0, 0, 0, 0.6) !important" }}>
                    {label}
                  </FormLabel>
                  <Switch
                    size="small"
                    checked={key === null ? activeTextTypes.length === 0 : activeTextTypes.includes(key)}
                    onChange={() => {
                      if (key === null) {
                        if (activeTextTypes.length === 0) { setActiveTextTypes(['other']); setTextTypeParam(['other']); }
                        else { setActiveTextTypes([]); setTextTypeParam([]); }
                      } else {
                        handleTextTypeToggle(key);
                      }
                    }}
                    disabled={disabled}
                  />
                </Box>
              </Tooltip>
            ))}
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
                {/* Master toggle: selects "ara" only when already on; resets to all otherwise */}
                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                  <FormLabel sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>
                    All languages
                  </FormLabel>
                  <Switch
                    size="small"
                    checked={activeLanguages.length === 0}
                    onChange={() => {
                      if (activeLanguages.length === 0) { setActiveLanguages(['ara']); setLanguageParam(['ara']); }
                      else { setActiveLanguages([]); setLanguageParam([]); }
                    }}
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
