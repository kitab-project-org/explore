import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"


const FilterNavigation = ({ showFilters }) => {
  const {
    showPrimary, setShowPrimary,
    showSecondary, setShowSecondary,
    activeTextTypes, setActiveTextTypes,
    activeLanguages, setActiveLanguages,
    allReleasesInsights,
  } = useContext(Context);

  // union of all language codes → labels across every release, for chip labels
  const allLanguages = allReleasesInsights.reduce(
    (acc, r) => ({ ...acc, ...(r.languages ?? {}) }),
    {}
  );

  const handleLanguageChipDelete = (code) => {
    const remaining = activeLanguages.filter(l => l !== code);
    setActiveLanguages(remaining);
    const params = cleanSearchPagination(searchParams);
    navigateRaw({ ...params, language: remaining.length === 0 ? 'all' : remaining.join(',') });
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigateRaw = (params) => {
    const qs = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${v}`).join("&");
    navigate({ search: `?${qs}` });
  };
  const [annotationStatus, setAnnotationStatus] = useState([]);

  // reset search params from url
  const handleDeleteSearchParams = (value, field) => {
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

  const hasChips =
    !showSecondary ||
    !showPrimary ||
    activeTextTypes.length > 0 ||
    activeLanguages.length > 0 ||
    annotationStatus.some(item => item);

  return (
    <Box
      id="FilterNavigation"
      display={showFilters || !hasChips ? "none" : "flex"}
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
      {!showSecondary && (
        <Tooltip title="Click to include secondary texts.">
          <Button onClick={() => {
            setShowSecondary(true);
            const params = cleanSearchPagination(searchParams);
            setSearchParams({ ...params, version: showPrimary ? 'all' : 'sec' });
          }}
            sx={{ bgcolor: "#e5e7eb", px: "18px", borderRadius: "50px", py: "5px", mr: "10px", mb: { xs: "10px", sn: "0px" } }}>
            <Typography variant="body2" sx={{ textTransform: "none", color: "#333" }}>
              Secondary texts excluded <i className="fa-solid fa-xmark" style={{ fontSize: "12px" }}></i>
            </Typography>
          </Button>
        </Tooltip>
      )}
      {!showPrimary && (
        <Tooltip title="Click to include primary texts.">
          <Button onClick={() => {
            setShowPrimary(true);
            const params = cleanSearchPagination(searchParams);
            setSearchParams({ ...params, version: showSecondary ? 'all' : 'pri' });
          }}
            sx={{ bgcolor: "#e5e7eb", px: "18px", borderRadius: "50px", py: "5px", mr: "10px", mb: { xs: "10px", sn: "0px" } }}>
            <Typography variant="body2" sx={{ textTransform: "none", color: "#333" }}>
              Primary texts excluded <i className="fa-solid fa-xmark" style={{ fontSize: "12px" }}></i>
            </Typography>
          </Button>
        </Tooltip>
      )}
      {(() => {
        const manuscriptsOnly = activeTextTypes.length === 1 && activeTextTypes.includes('manuscripts');
        const ocrOnly = activeTextTypes.length === 1 && activeTextTypes.includes('ocr');
        const chips = [];
        if (manuscriptsOnly) {
          chips.push({ key: 'manuscripts-only', label: 'Manuscripts only', onClick: () => {
            setActiveTextTypes([]);
            setSearchParams({ ...cleanSearchPagination(searchParams), text_type: 'all' });
          }});
        }
        if (ocrOnly) {
          chips.push({ key: 'ocr-only', label: 'Uncorrected OCR only', onClick: () => {
            setActiveTextTypes([]);
            setSearchParams({ ...cleanSearchPagination(searchParams), text_type: 'all' });
          }});
        }
        if (activeTextTypes.length > 0 && !activeTextTypes.includes('manuscripts') && !ocrOnly) {
          chips.push({ key: 'manuscripts-excl', label: 'Manuscripts excluded', onClick: () => {
            const newTypes = [...activeTextTypes, 'manuscripts'];
            setActiveTextTypes(newTypes);
            navigateRaw({ ...cleanSearchPagination(searchParams), text_type: newTypes.join(',') });
          }});
        }
        if (activeTextTypes.length > 0 && !activeTextTypes.includes('ocr') && !manuscriptsOnly) {
          chips.push({ key: 'ocr-excl', label: 'Uncorrected OCR excluded', onClick: () => {
            const newTypes = [...activeTextTypes, 'ocr'];
            setActiveTextTypes(newTypes);
            navigateRaw({ ...cleanSearchPagination(searchParams), text_type: newTypes.join(',') });
          }});
        }
        return chips.map(({ key, label, onClick }) => (
          <Tooltip key={key} title="Click to remove this filter.">
            <Button onClick={onClick}
              sx={{ bgcolor: "#e5e7eb", px: "18px", borderRadius: "50px", py: "5px", mr: "10px", mb: { xs: "10px", sn: "0px" } }}>
              <Typography variant="body2" sx={{ textTransform: "none", color: "#333" }}>
                {label} <i className="fa-solid fa-xmark" style={{ fontSize: "12px" }}></i>
              </Typography>
            </Button>
          </Tooltip>
        ));
      })()}
      {activeLanguages.length > 0 &&
        activeLanguages.map(code => (
          <Tooltip key={code} title={allLanguages[code] ?? code} arrow>
            <Button
              onClick={() => handleLanguageChipDelete(code)}
              sx={{
                bgcolor: "#e5e7eb",
                px: "18px",
                borderRadius: "50px",
                py: "5px",
                mr: "10px",
                mb: { xs: "10px", sn: "0px" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#333", textTransform: "lowercase" }}
              >
                {code}{" "}
                <i className="fa-solid fa-xmark" style={{ fontSize: "12px" }}></i>
              </Typography>
            </Button>
          </Tooltip>
        ))
      }
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
