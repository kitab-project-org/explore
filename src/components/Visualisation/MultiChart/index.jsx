import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import * as d3 from "d3";
import ScatterPlot from "./ScatterPlot";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import MultiFilter from "./MultiFilter";
import TocFilter from "./filters/TocFilter";
import ScatterLegend from "./ScatterLegend";
import MilestoneTextPanel from "./MilestoneTextPanel";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import VisualizationHeader from "../SectionHeader/VisualizationHeader";
import { getHighestValueInArrayOfObjects, wrapTextToSvgWidth } from "../../../utility/Helper";
import { useSearchParams } from "react-router-dom";
import { Context } from "../../../App";


const MultiVisual = ({ includeURL, setIncludeURL, ...props }) => {
  console.log("RENDERING MULTI CHART");

  const {
    metaData,
    chartData,
    setXScale,
    setYScale,
    colorScale,
    selfReuseOnly,
    visMargins,
    releaseCode,
    selectedMarker,
    setSelectedMarker,
    axisLabelFontSize,
    setSelfReuseOnly,
    downloadedTexts,
    setDownloadedTexts,
  } = useContext(Context);

  const [searchParams, setSearchParams] = useSearchParams();

  // Helper: read a [min, max] pair from a single "key=min,max" URL param.
  const getRangeParam = (key, fallback) => {
    const val = searchParams.get(key);
    if (!val) return fallback;
    const [a, b] = val.split('-').map(Number);
    return (!isNaN(a) && !isNaN(b)) ? [a, b] : fallback;
  };

  // TODO: let user set width/height (with resizable component or input field?)
  var width = 1000 - visMargins.left - visMargins.right;
  var height = 600 - visMargins.top - visMargins.bottom;

  const book1 = metaData.book1;
  const mainBookURI = book1.bookTitle?.path ?? book1.shelfmark ?? book1.versionCode ?? "";
  const mainAuthor = mainBookURI.split(".")[0];
  const mainAuthorDate = parseInt(mainAuthor.slice(0, 4));


  // extract relevant objects from chartData:
  let {
    versionCode,
    isUpload,
    tokens,
    mainBookMilestones: storedMainBookMilestones,
    msData,
    bookStats,
    maxTotalChMatch
  } = chartData;

  console.log(chartData);

  // Full date range of the loaded dataset (used as slider bounds and for reset):
  let _minDate = Infinity, _maxDate = -Infinity;
  for (const b of chartData.bookStats) {
    if (b.date !== null) {
      if (b.date < _minDate) _minDate = b.date;
      if (b.date > _maxDate) _maxDate = b.date;
    }
  }
  const fullDateRange = isFinite(_minDate) ? [_minDate, _maxDate] : [0, 1500];

  const initDateRange = getRangeParam("date", fullDateRange);
  const [dateRange, setDateRange] = useState(initDateRange);
  const initMsRange = getRangeParam("mss", [1, storedMainBookMilestones ?? Math.ceil(tokens?.first / 300)]);
  const [msRange, setMsRange] = useState(initMsRange);
  const [uploadDialogBook, setUploadDialogBook] = useState(null);
  const pairwiseUploadRef = useRef(null);
  const handleUploadPropRef = useRef(props.handleUpload);
  useEffect(() => { handleUploadPropRef.current = props.handleUpload; });
  const handlePairwiseUpload = useCallback((files) => {
    setUploadDialogBook(null);
    handleUploadPropRef.current(files);
  }, []);
  let maxbc = getHighestValueInArrayOfObjects(bookStats.filter(d => d.id !== versionCode), "ch_match");
  const fullBookCharRange = [1, maxbc];
  const initBookCharRange = getRangeParam("bookAlignedChars", fullBookCharRange);
  const [bookCharRange, setBookCharRange] = useState(initBookCharRange);
  let maxalign = getHighestValueInArrayOfObjects(bookStats.filter(d => d.id !== versionCode), "alignments");
  const fullAlignRange = [1, maxalign];
  const initAlignRange = getRangeParam("bookAlignments", fullAlignRange);
  const [bookAlignRange, setBookAlignRange] = useState(initAlignRange);
  let maxmschars = getHighestValueInArrayOfObjects(msData, "ch_match");
  const fullMsCharsRange = [1, maxmschars];
  const initMsCharsRange = getRangeParam("MsChars", fullMsCharsRange);
  const [msCharsRange, setMsCharsRange] = useState(initMsCharsRange);
  const [filterBooksToMsRange, setFilterBooksToMsRange] = useState(
    () => searchParams.get("filterBooksToMs") !== "0"  // default true; URL param can override
  );

  const initSelectedSectionIds = (() => {
    const sections = searchParams.get("sections");
    if (!sections) return null;
    const ids = sections.split(",").map(Number).filter(n => !isNaN(n));
    return ids.length > 0 ? new Set(ids) : null;
  })();
  // Guard: skip the setSelectedSectionIds(null) reset on first mount when sections came from URL.
  const sectionsFromURLRef = useRef(initSelectedSectionIds !== null);

  const [toc, setToc] = useState(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState(initSelectedSectionIds);
  useEffect(() => {
    if (sectionsFromURLRef.current) {
      sectionsFromURLRef.current = false;
    } else {
      setSelectedSectionIds(null);
    }
    const vc = metaData?.book1?.versionCode?.split("-")[0];
    if (!vc || !releaseCode) return;
    const url = `https://raw.githubusercontent.com/OpenITI/openiti_toc/refs/heads/v${releaseCode}/tocs/${vc}_TOC.json`;
    let cancelled = false;
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled) setToc(data); })
      .catch(() => { if (!cancelled) setToc(null); });
    return () => { cancelled = true; };
  }, [metaData?.book1?.versionCode, releaseCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // hasDates uses unfiltered data (for MultiFilter display):
  const hasDates = chartData.bookStats.some(d => d.date !== null);

  const mainBookMilestones = storedMainBookMilestones ?? Math.ceil(tokens.first / 300);
  const fullMilestoneRange = [1, mainBookMilestones];

  const [milestoneTextInfo, setMilestoneTextInfo] = useState(null); // { ms_id, text, loading }
  const [textFilter, setTextFilter] = useState(null); // { ms_id, start, end } char range
  const textPanelRef = useRef(null);
  useEffect(() => {
    if (milestoneTextInfo) textPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [milestoneTextInfo]);

  // Memoize the entire filter + index pipeline so that array references are stable
  // when only selectedMarker changes (selectedMarker is not a dep here).
  const {
    filteredMsData,
    filteredBookStats,
    filteredBookUriDict,
    filteredMsStats,
    displayMsRange,
    dataDateRange,
  } = useMemo(() => {
    const origBookUriDict = chartData.bookUriDict;
    let msData = chartData.msData;
    let bStats = chartData.bookStats;
    let dataDateRange = dateRange;
    console.log("MultiChart: bStats before filtering:");
    console.log(bStats);

    if (selfReuseOnly) {
      msData = msData.filter(
        (d) => d.id2 === versionCode || origBookUriDict[d.id2]?.[0]?.split(".")[0] === mainAuthor
      );
      bStats = bStats.filter((d) => (d.book ?? "").split(".")[0] === mainAuthor);
      dataDateRange = isNaN(mainAuthorDate) ? [0, 1500] : [mainAuthorDate, mainAuthorDate + 1];
    }

    const [minDate, maxDate] = dateRange;
    const [minBookChars, maxBookChars] = bookCharRange;
    const [minAlignments, maxAlignments] = bookAlignRange;
    const [minMsChars, maxMsChars] = msCharsRange;
    const [minMs, maxMs] = msRange;

    msData = msData.filter((d) =>
      (d.id2 === versionCode || d.date === null || (d.date >= minDate && d.date <= maxDate)) &&
      d.ch_match <= maxMsChars &&
      d.ch_match >= minMsChars &&
      d.ms1 >= minMs && d.ms1 <= maxMs
    );
    bStats = bStats.filter((d) =>
      (d.id === versionCode || d.date === null || (d.date >= minDate && d.date <= maxDate)) &&
      (selfReuseOnly && d.book === mainBookURI ? 1 : d.ch_match >= minBookChars) &&
      (selfReuseOnly && d.book === mainBookURI ? 1 : d.ch_match <= maxBookChars) &&
      (d.id === versionCode || (d.alignments >= minAlignments && d.alignments <= maxAlignments))
    );

    // Remove X-axis books that have no alignments in the current milestone range:
    if (filterBooksToMsRange) {
      const idsWithData = new Set(msData.map(d => d.id2));
      bStats = bStats.filter(d => d.id === versionCode || idsWithData.has(d.id));
    }

    // Text-selection filter: keep only dots whose alignment overlaps the selected cleaned-char range.
    if (textFilter) {
      const { ms_id, cleanedStart, cleanedEnd } = textFilter;
      msData = msData.filter(d =>
        d.ms1 === ms_id &&
        (d.alignments ?? []).some(a => a.b1 != null && a.e1 != null && a.b1 < cleanedEnd && a.e1 > cleanedStart)
      );
    }

    // TOC section filter + Y axis zoom:
    let displayMsRange = msRange;
    if (selectedSectionIds && selectedSectionIds.size > 0 && toc) {
      const sectionRanges = Array.from(selectedSectionIds).map(id => {
        const sec = toc.sections[id];
        return [sec.start_ms, sec.end_ms];
      });
      msData = msData.filter(d =>
        sectionRanges.some(([start, end]) => d.ms1 >= start && d.ms1 <= end)
      );
      const minDisplay = Math.max(msRange[0], Math.min(...sectionRanges.map(([s]) => s)));
      const maxDisplay = Math.min(msRange[1], Math.max(...sectionRanges.map(([, e]) => e)));
      if (minDisplay <= maxDisplay) displayMsRange = [minDisplay, maxDisplay];
    }

    /*// Sort filtered books alphabetically by URI (= chronologically, since URIs start with 4-digit date).
    // Main book is pinned to position 0; remaining books are sorted and assigned sequential indices.
    // Sorting here rather than relying on chartData order makes the useMemo self-contained.
    const mainBook = bStats.find(d => d.id === versionCode);
    const otherBooks = bStats
      .filter(d => d.id !== versionCode)
      .sort((a, b) => {
        const aKey = a.book ?? a.manuscript ?? a.id ?? '';
        const bKey = b.book ?? b.manuscript ?? b.id ?? '';
        return aKey > bKey ? 1 : bKey > aKey ? -1 : 0;
      });
    const sortedBStats = mainBook ? [mainBook, ...otherBooks] : otherBooks;*/

    // Build bookIndexDict first so filteredMsData can reference it.
    const bookIndexDict = {};
    const newBookUriDict = {};
    let nextIndex = 1;
    bStats.forEach((d) => {
      bookIndexDict[d.id] = d.id === versionCode ? 0 : nextIndex++;
      newBookUriDict[d.id] = [d.book ?? d.manuscript];
    });

    const filteredMsData = msData.map(d => ({
      ...d,
      bookIndex: bookIndexDict[d.id2],
    }));

    // When milestone range or TOC section filter is active, recalculate per-book
    // ch_match and alignments from filteredMsData (which only contains visible data points).
    const isMsFiltered = msRange[0] !== 1 || msRange[1] !== mainBookMilestones;
    const isTocFiltered = (selectedSectionIds?.size ?? 0) > 0;
    let bookChMatchRecalc = null, bookAlignmentsRecalc = null;
    if (isMsFiltered || isTocFiltered) {
      bookChMatchRecalc = {};
      bookAlignmentsRecalc = {};
      for (const d of filteredMsData) {
        if (d.id2 !== versionCode) {
          bookChMatchRecalc[d.id2] = (bookChMatchRecalc[d.id2] || 0) + d.ch_match;
          bookAlignmentsRecalc[d.id2] = (bookAlignmentsRecalc[d.id2] || 0) + (Array.isArray(d.alignments) ? d.alignments.length : 1);
        }
      }
    }

    // Recalculate index numbers — create new objects to avoid mutating chartData.
    // The main book always gets bookIndex=0 so its dots sit on the Y axis (xScale(0)=0)
    // regardless of how many books are in the filtered set.
    const filteredBookStats = bStats.map((d) => ({
      ...d,
      bookIndex: bookIndexDict[d.id],
      ch_match:   bookChMatchRecalc    ? (bookChMatchRecalc[d.id]    ?? 0) : d.ch_match,
      alignments: bookAlignmentsRecalc ? (bookAlignmentsRecalc[d.id] ?? 0) : d.alignments,
    }));

    // Recalculate msStats:
    const msStatsObj = {};
    for (const d of filteredMsData) {
      if (d.id2 !== versionCode) {
        if (!msStatsObj[d.ms1]) msStatsObj[d.ms1] = { ch_match: 0, alignments: 0 };
        msStatsObj[d.ms1].ch_match += d.ch_match;
        msStatsObj[d.ms1].alignments += Array.isArray(d.alignments) ? d.alignments.length : 1;
      }
    }
    const filteredMsStats = Object.keys(msStatsObj).map(key => ({
      ms_id: parseInt(key),
      ch_match_total: msStatsObj[key].ch_match,
      alignments_total: msStatsObj[key].alignments,
    }));

    return {
      filteredMsData,
      filteredBookStats,
      filteredBookUriDict: newBookUriDict,
      filteredMsStats,
      displayMsRange,
      dataDateRange,
    };
  }, [chartData, selfReuseOnly, mainAuthor, mainAuthorDate, mainBookURI, versionCode,
      dateRange, bookCharRange, bookAlignRange, msCharsRange, msRange, mainBookMilestones,
      filterBooksToMsRange, selectedSectionIds, toc, textFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep full ranges in a ref so restoreCanvas can be a stable useCallback:
  const fullRangesRef = useRef(null);
  fullRangesRef.current = {
    fullDateRange,
    fullBookCharRange,
    fullAlignRange,
    fullMsCharsRange,
    defaultMsRange: [1, storedMainBookMilestones ?? Math.ceil(tokens?.first / 300)],
    setSelfReuseOnly,
  };

  const restoreCanvas = useCallback(() => {
    const r = fullRangesRef.current;
    setDateRange(r.fullDateRange);
    setMsRange(r.defaultMsRange);
    setBookCharRange(r.fullBookCharRange);
    setBookAlignRange(r.fullAlignRange);
    setMsCharsRange(r.fullMsCharsRange);
    setSelectedSectionIds(null);
    setFilterBooksToMsRange(false);
    setTextFilter(null);
    setMilestoneTextInfo(null);
    setSelectedMs(null);
    r.setSelfReuseOnly(false);
    setSelectedMarker(null);
    setFilterResetKey(k => k + 1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("ms1");
      next.delete("id2");
      next.delete("align_no");
      next.delete("ms2");
      return next;
    }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset the date filter when self-reuse mode is enabled
  // (self-reuse ignores dates, so a date filter would be misleading).
  useEffect(() => {
    if (selfReuseOnly) {
      setDateRange(fullRangesRef.current.fullDateRange);
      setFilterResetKey(k => k + 1);
    }
  }, [selfReuseOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // build variables needed to create axes:
  /*const maxChMatch = msData.reduce(
    (a,b) => a.ch_match > b.ch_match ? a : b
    ).ch_match;
  const minChMatch = msData.reduce(
    (a,b) => a.ch_match < b.ch_match ? a : b
    ).ch_match;*/
  const [minChMatch, maxChMatch] = d3.extent(filteredMsData, (d) => d.ch_match);

  const filteredMsRangeSize = displayMsRange[1] - displayMsRange[0] + 1;
  let dotSize = Math.min(
    Math.ceil(width / filteredBookStats.length / 2),
    Math.ceil(height / filteredMsRangeSize / 2),
    5
  );

  const bottomBarMargin = useMemo(() => ({ ...visMargins, top: 0 }), [visMargins]);

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [statMetric, setStatMetric] = useState("alignments"); // "alignments" | "characters"
  const [includeLegend,       setIncludeLegend]       = useState(true);
  const [includeSidebar,      setIncludeSidebar]      = useState(true);
  const [includeBottomBar,    setIncludeBottomBar]    = useState(true);
  const [selectedMs,  setSelectedMs]  = useState(null); // { ms_id } — lifted from SideBar
  const [selectedBar, setSelectedBar] = useState(null); // { id }    — lifted from BottomBar
  const handleSetSelectedMs  = useCallback((ms)  => { setSelectedMs(ms);   if (ms) { setSelectedBar(null);  setSelectedMarker(null); } }, [setSelectedMarker]);
  const handleSetSelectedBar = useCallback((bar) => { setSelectedBar(bar); if (bar) { setSelectedMs(null);  setSelectedMarker(null); } }, [setSelectedMarker]);
  useEffect(() => { if (selectedMarker) { setSelectedMs(null); setSelectedBar(null); } }, [selectedMarker]); // eslint-disable-line react-hooks/exhaustive-deps
  const onUploadRequest = useCallback((d) => setUploadDialogBook(d), []);

  const handleViewMilestoneText = useCallback(async (ms_id) => {
    setMilestoneTextInfo({ ms_id, text: null, loading: true });
    const text = await getMilestoneText(
      releaseCode, versionCode, ms_id, downloadedTexts, setDownloadedTexts
    );
    setMilestoneTextInfo({ ms_id, text: text ?? null, loading: false });
  }, [releaseCode, versionCode, downloadedTexts, setDownloadedTexts]); // eslint-disable-line react-hooks/exhaustive-deps
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [toggle, setToggle] = useState(false);
  const multiVisRef = useRef(null);
  const [tocPanelBounds, setTocPanelBounds] = useState({ top: 0, height: "100%" });
  useEffect(() => {
    const update = () => {
      const el = multiVisRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTocPanelBounds({ top: rect.top, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    if (multiVisRef.current) observer.observe(multiVisRef.current);
    window.addEventListener("scroll", update);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); };
  }, []);
  // showTocPanel is independent from showFilterPanel so X closes only the TOC slide-out.
  const [showTocPanel, setShowTocPanel] = useState(true);
  // Reset showTocPanel whenever the filter button opens the panel.
  useEffect(() => { if (showFilterPanel) setShowTocPanel(true); }, [showFilterPanel]);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);

      const setOrDeleteRange = (key, condition, min, max) =>
        condition ? next.set(key, `${min}-${max}`) : next.delete(key);
      const setOrDelete = (key, condition, value) =>
        condition ? next.set(key, String(value)) : next.delete(key);

      setOrDeleteRange("date", hasDates && (dateRange[0] !== fullDateRange[0] || dateRange[1] !== fullDateRange[1]), dateRange[0], dateRange[1]);
      setOrDeleteRange("mss", msRange[0] !== fullMilestoneRange[0] || msRange[1] !== fullMilestoneRange[1], msRange[0], msRange[1]);
      setOrDeleteRange("bookAlignedChars", bookCharRange[0] !== fullBookCharRange[0] || bookCharRange[1] !== fullBookCharRange[1], bookCharRange[0], bookCharRange[1]);
      setOrDeleteRange("bookAlignments", bookAlignRange[0] !== fullAlignRange[0] || bookAlignRange[1] !== fullAlignRange[1], bookAlignRange[0], bookAlignRange[1]);
      setOrDeleteRange("MsChars", msCharsRange[0] !== fullMsCharsRange[0] || msCharsRange[1] !== fullMsCharsRange[1], msCharsRange[0], msCharsRange[1]);
      if (selectedSectionIds?.size > 0) {
        next.set("sections", Array.from(selectedSectionIds).join(","));
      } else {
        next.delete("sections");
      }
      setOrDelete("filterBooksToMs", !filterBooksToMsRange, 0);  // write "0" only when off

      return next;
    }, { replace: true });
  }, [dateRange, msRange, bookCharRange, bookAlignRange, msCharsRange, selectedSectionIds, filterBooksToMsRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilters = [
    hasDates && (dateRange[0] !== fullDateRange[0] || dateRange[1] !== fullDateRange[1]) &&
      `Date: ${dateRange[0]}–${dateRange[1]}`,
    (msRange[0] !== fullMilestoneRange[0] || msRange[1] !== fullMilestoneRange[1]) &&
      `Milestones: ${msRange[0]}–${msRange[1]}`,
    (bookCharRange[0] !== fullBookCharRange[0] || bookCharRange[1] !== fullBookCharRange[1]) &&
      `Book chars: ${bookCharRange[0].toLocaleString()}–${bookCharRange[1].toLocaleString()}`,
    (bookAlignRange[0] !== fullAlignRange[0] || bookAlignRange[1] !== fullAlignRange[1]) &&
      `Alignments: ${bookAlignRange[0]}–${bookAlignRange[1]}`,
    (msCharsRange[0] !== fullMsCharsRange[0] || msCharsRange[1] !== fullMsCharsRange[1]) &&
      `MS chars: ${msCharsRange[0].toLocaleString()}–${msCharsRange[1].toLocaleString()}`,
    (selectedSectionIds?.size > 0) &&
      `${selectedSectionIds.size} section${selectedSectionIds.size > 1 ? 's' : ''} selected`,
    filterBooksToMsRange && (msRange[0] !== fullMilestoneRange[0] || msRange[1] !== fullMilestoneRange[1]) && "Books outside milestone range hidden",
    selfReuseOnly && "Self reuse only",
  ].filter(Boolean);

  return (
    <Box sx={{ mt: "40px" }}>
      <SectionHeaderLayout
        item={{
          title: "One-to-Many Visualization",
          icon: "fa-solid fa-chart-column",
        }}
        toggle={toggle}
        setToggle={setToggle}
        mb={showFilterPanel ? 0 : "20px"}
        showDownloadOptions={showDownloadOptions}
        includeURL={includeURL}
        setIncludeURL={setIncludeURL}
        includeLegend={includeLegend}
        setIncludeLegend={setIncludeLegend}
        includeSidebar={includeSidebar}
        setIncludeSidebar={setIncludeSidebar}
        includeBottomBar={includeBottomBar}
        setIncludeBottomBar={setIncludeBottomBar}
      >
        <VisualizationHeader
          restoreCanvas={restoreCanvas}
          isPairwiseViz={props.isPairwiseViz}
          showFilterPanel={showFilterPanel}
          setShowFilterPanel={setShowFilterPanel}
          showDownloadOptions={showDownloadOptions}
          setShowDownloadOptions={setShowDownloadOptions}
          activeFilters={activeFilters}
        />
      </SectionHeaderLayout>


      <Box
        sx={{
          display: showFilterPanel ? "block" : "none",
          bgcolor: "#F0F0F5",
          borderRadius: "5px",
          borderTop: "1px solid white",
        }}
      >
        <MultiFilter
          key={filterResetKey}
          hasDates={hasDates}
          fullDateRange={fullDateRange}
          setDateRange={setDateRange}
          initialDateRange={selfReuseOnly ? fullDateRange : initDateRange}
          fullMilestoneRange={fullMilestoneRange}
          setMsRange={setMsRange}
          initialMsRange={initMsRange}
          fullBookCharRange={fullBookCharRange}
          setBookCharRange={setBookCharRange}
          initialBookCharRange={initBookCharRange}
          fullAlignRange={fullAlignRange}
          setBookAlignRange={setBookAlignRange}
          initialAlignRange={initAlignRange}
          msCharsRange={msCharsRange}
          setMsCharsRange={setMsCharsRange}
          filterBooksToMsRange={filterBooksToMsRange}
          setFilterBooksToMsRange={setFilterBooksToMsRange}
          statMetric={statMetric}
          setStatMetric={setStatMetric}
        />
      </Box>

      {(() => {
        if (!showDownloadOptions || !includeURL) return null;
        const urlFontSize = Math.min(axisLabelFontSize, 12);
        const scatterSvgWidth = width + visMargins.left + visMargins.right;
        const sidebarSvgWidth = 100 + visMargins.left + visMargins.right;
        const urlSvgWidth = includeSidebar
          ? scatterSvgWidth + 20 + sidebarSvgWidth
          : scatterSvgWidth;
        const urlLines = wrapTextToSvgWidth(
          window.location.href, urlSvgWidth - visMargins.left - 10, urlFontSize
        );
        const urlSvgHeight = urlFontSize * 1.3 * urlLines.length + 4;
        return (
          <svg
            id="url-label-svg"
            width={urlSvgWidth}
            height={urlSvgHeight}
            style={{ display: "block", fontFamily: "Arial" }}
          >
            {urlLines.map((line, i) => (
              <text
                key={i}
                x={visMargins.left + width / 2}
                y={urlFontSize * 1.3 * (i + 1)}
                textAnchor="middle"
                style={{ fontSize: `${urlFontSize}px`, textDecoration: "underline" }}
              >
                {line}
              </text>
            ))}
          </svg>
        );
      })()}

      <Box sx={{ ml: `${visMargins.left}px`, width: `${width}px`, display: "flex", justifyContent: "center" }}>
        <ScatterLegend
          colorScale={colorScale}
          width={Math.round((width + visMargins.left + visMargins.right) * 2 / 3)}
          margin={0}
        />
      </Box>

      <Box
        id="multiVis"
        ref={multiVisRef}
        sx={{
          position: "relative",
          overflowX: "clip",
          px: {
            xs: "0px",
            sm: "30px",
          },
        }}
      >
        <>
          <div
            id={"upperContainer"}
            style={{
              overflow: "hidden",
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ float: "left" }}>
              <ScatterPlot
                mainBookMilestones={mainBookMilestones}
                msRange={displayMsRange}
                mainBookURI={mainBookURI}
                versionCode={versionCode}
                isUpload={isUpload}
                bookStats={filteredBookStats}
                maxTotalChMatch={maxTotalChMatch}
                msdata={filteredMsData}
                maxChMatch={maxChMatch}
                minChMatch={minChMatch}
                margin={visMargins}
                width={width}
                height={height}
                dotSize={dotSize}
                bookUriDict={filteredBookUriDict}
                setXScale={setXScale}
                setYScale={setYScale}
                selectedMs={selectedMs}
                selectedBar={selectedBar}
              />
            </div>
            <div
              style={{
                float: "right",
                position: "absolute",
                left: `${width + visMargins.left + visMargins.right + 20}px`,
              }}
            >
              <SideBar
                mainBookMilestones={mainBookMilestones}
                msRange={displayMsRange}
                msStats={filteredMsStats}
                toc={toc}
                width={100}
                height={height}
                margin={visMargins}
                selectedMs={selectedMs}
                setSelectedMs={handleSetSelectedMs}
                statMetric={statMetric}
                onViewMilestoneText={handleViewMilestoneText}
              />
            </div>
          </div>
          <BottomBar
            margin={bottomBarMargin}
            width={width}
            height={120}
            bookStats={filteredBookStats}
            mainBookURI={mainBookURI}
            dateRange={dataDateRange}
            isUpload={isUpload}
            hasDates={hasDates}
            onUploadRequest={onUploadRequest}
            selectedBar={selectedBar}
            setSelectedBar={handleSetSelectedBar}
            statMetric={statMetric}
          />
          {milestoneTextInfo && (
            <Box ref={textPanelRef} sx={{ mx: `${visMargins.left}px`, maxWidth: `${width + visMargins.right}px` }}>
              <MilestoneTextPanel
                ms_id={milestoneTextInfo.ms_id}
                text={milestoneTextInfo.text}
                loading={milestoneTextInfo.loading}
                versionCode={versionCode}
                releaseCode={releaseCode}
                alignments={filteredMsData.filter(d => d.ms1 === milestoneTextInfo.ms_id)}
                onClose={() => { setMilestoneTextInfo(null); setTextFilter(null); }}
                onFilter={({ cleanedStart, cleanedEnd }) =>
                  setTextFilter({ ms_id: milestoneTextInfo.ms_id, cleanedStart, cleanedEnd })}
              />
            </Box>
          )}
          <Dialog
            open={uploadDialogBook !== null}
            onClose={() => setUploadDialogBook(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Upload pairwise TSV file</DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2 }}>
                Please upload the pairwise TSV file for{" "}
                <strong>{uploadDialogBook?.book ?? uploadDialogBook?.id}</strong>:
              </Typography>
              <Typography
                sx={{ mb: 2, fontFamily: "monospace", wordBreak: "break-all" }}
              >
                {versionCode}_{uploadDialogBook?.id}.csv
              </Typography>
              <Box
                sx={{
                  border: "2px dashed grey",
                  borderRadius: "8px",
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#2862a5", color: "#2862a5" },
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePairwiseUpload(e.dataTransfer.files);
                }}
                onClick={() => pairwiseUploadRef.current?.click()}
              >
                <i
                  className="fa-solid fa-cloud-arrow-up"
                  style={{ fontSize: "2em", display: "block", marginBottom: "8px" }}
                />
                <Typography>Drag &amp; drop a TSV file here, or click to browse</Typography>
                <input
                  ref={pairwiseUploadRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => handlePairwiseUpload(e.target.files)}
                />
              </Box>
            </DialogContent>
          </Dialog>
        </>
        <div className={"vizTooltip"} sx={{ style: "opacity: 0" }} />
        <Box
          sx={{
            position: "fixed",
            top: tocPanelBounds.top,
            height: tocPanelBounds.height,
            right: 0,
            width: "300px",
            bgcolor: "background.paper",
            boxShadow: "-3px 0 12px rgba(0,0,0,0.18)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transform: (showFilterPanel && showTocPanel && toc && Object.keys(toc.sections ?? {}).length > 0) ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.25s ease",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pt: 0.5, flexShrink: 0 }}>
            <IconButton size="small" onClick={() => setShowTocPanel(false)}>
              <i className="fa-solid fa-xmark" style={{ fontSize: "14px" }} />
            </IconButton>
          </Box>
          <TocFilter
            toc={toc}
            selectedSectionIds={selectedSectionIds}
            setSelectedSectionIds={setSelectedSectionIds}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MultiVisual;
