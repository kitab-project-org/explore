import { Box, Typography } from "@mui/material";
import { useContext, useEffect, useState, useRef } from "react";
//import { useSearchParams } from "react-router-dom";
import Section, { MetadataSvg } from "../Metadata/Section";
import TocFilter from "../MultiChart/filters/TocFilter";
import { getSectionHierarchy, getMilestoneHeadings } from "../../../utility/TocHelper";
import MSToggler from "../SectionHeader/MSToggler";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import VisualizationHeader from "../SectionHeader/VisualizationHeader";
import { Context } from "../../../App";
import { extractAlignment } from "../../../functions/alignmentFunctions";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import { getHighestValueInArrayOfObjects, wrapTextToSvgWidth, getMetaLabel } from "../../../utility/Helper";
import * as d3 from "d3";


const TOC_ROW_HEIGHT = 16; // px per TOC marker row; shared by drawTocMarkers and margin calc

// TOC navigation helpers (module-level, pure):
function getTocSiblings(toc, id) {
  if (!toc?.sections?.[id]) return [id];
  const parent = toc.sections[id]?.parent;
  return Object.keys(toc.sections)
    .filter(sid => {
      const p = toc.sections[sid]?.parent;
      return (!parent && !p) || String(p) === String(parent);
    })
    .map(Number)
    .sort((a, b) => (toc.sections[a]?.start_ms ?? 0) - (toc.sections[b]?.start_ms ?? 0));
}
function getTocChildren(toc, id) {
  if (!toc?.sections) return [];
  return Object.keys(toc.sections)
    .filter(sid => String(toc.sections[sid]?.parent) === String(id))
    .map(Number)
    .sort((a, b) => (toc.sections[a]?.start_ms ?? 0) - (toc.sections[b]?.start_ms ?? 0));
}
// Tree-walk: at the last sibling, climb to the parent's next sibling (recursively).
function getTocNext(toc, id) {
  const siblings = getTocSiblings(toc, id);
  const idx = siblings.indexOf(id);
  if (idx < siblings.length - 1) return siblings[idx + 1];
  const parent = toc.sections[id]?.parent;
  if (parent != null) return getTocNext(toc, typeof parent === 'number' ? parent : parseInt(parent));
  return null;
}
function getTocPrev(toc, id) {
  const siblings = getTocSiblings(toc, id);
  const idx = siblings.indexOf(id);
  if (idx > 0) return siblings[idx - 1];
  const parent = toc.sections[id]?.parent;
  if (parent != null) return getTocPrev(toc, typeof parent === 'number' ? parent : parseInt(parent));
  return null;
}

// Returns the visible rows of TOC triangles for a given expand state.
// rows[0] = roots, rows[1] = visible children of expanded roots, etc.
function getRows(toc, expanded) {
  if (!toc?.sections) return [];
  const allIds = Object.keys(toc.sections).map(Number);
  const roots = allIds
    .filter(id => !toc.sections[id]?.parent)
    .sort((a, b) => (toc.sections[a]?.start_ms ?? 0) - (toc.sections[b]?.start_ms ?? 0));
  if (roots.length === 0) return [];
  const rows = [roots];
  let current = roots;
  while (current.length) {
    const expandedSet = new Set(current.filter(id => expanded.has(id)).map(String));
    if (!expandedSet.size) break;
    const children = allIds
      .filter(id => { const p = toc.sections[id]?.parent; return p != null && expandedSet.has(String(p)); })
      .sort((a, b) => (toc.sections[a]?.start_ms ?? 0) - (toc.sections[b]?.start_ms ?? 0));
    if (!children.length) break;
    rows.push(children);
    current = children;
  }
  return rows;
}

// Maximum number of TOC rows a tree can ever produce (used to reserve fixed SVG margin space).
function getMaxDepth(toc) {
  if (!toc?.sections) return 0;
  const allIds = new Set(Object.keys(toc.sections).map(Number));
  return getRows(toc, allIds).length;
}

const Visual = (props) => {
  const {
    chartData,
    metaData,
    //books,
    setBooks,
    //bookSectionRef,
    //focusMilestone1,
    //focusMilestone2,
    setBooksAlignment,
    isFlipped,
    dataLoading,
    setDataLoading,
    setFocusedDataIndex,
    setDisplayMs,
    focusedDataIndex,
    downloadedTexts,
    setDownloadedTexts,
    releaseCode,
    setTextAvailable,
    visMargins,
    includeMetaInDownload,
    metaPositionInDownload,
    url,
    axisLabelFontSize,
    tickFontSize,
    defaultMargins,
    yTickWidth,
  } = useContext(Context);

  const { includeURL, setIncludeURL } = props;

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTocMarkers, setIncludeTocMarkers] = useState(true);
  const includeTocMarkersRef = useRef(true);
  includeTocMarkersRef.current = includeTocMarkers;
  const [zoomMode, setZoomMode] = useState(false);
  const zoomModeRef = useRef(false);
  zoomModeRef.current = zoomMode;
  // Stable refs to brush groups so the zoomMode effect can toggle pointer-events:
  const brushGRef  = useRef(null);
  const brushG2Ref = useRef(null);
  const [showTocPanel, setShowTocPanel] = useState(false);
  const pairwiseChartRef = useRef(null);
  const [tocPanelBounds, setTocPanelBounds] = useState({ top: 0, height: "100%" });
  useEffect(() => {
    const update = () => {
      const el = pairwiseChartRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTocPanelBounds({ top: rect.top, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    if (pairwiseChartRef.current) observer.observe(pairwiseChartRef.current);
    window.addEventListener("scroll", update);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); };
  }, []);
  const [toc1, setToc1] = useState(null);
  const [toc2, setToc2] = useState(null);
  const [selectedSections1, setSelectedSections1] = useState(null);
  const [selectedSections2, setSelectedSections2] = useState(null);
  // Expanded section IDs for the in-chart TOC triangle markers:
  const [expandedTocMarkers1, setExpandedTocMarkers1] = useState(new Set());
  const [expandedTocMarkers2, setExpandedTocMarkers2] = useState(new Set());
  // Selected section ID per panel (for keyboard navigation):
  const [selectedTocMarker1, setSelectedTocMarker1] = useState(null);
  const [selectedTocMarker2, setSelectedTocMarker2] = useState(null);
  // Which panel ('top'|'bottom') had the last TOC click — drives keyboard nav:
  const activeTocPanelRef = useRef(null);
  const selectedTocMarkerRef = useRef({ m1: null, m2: null });
  selectedTocMarkerRef.current = { m1: selectedTocMarker1, m2: selectedTocMarker2 };
  // Always-current ref so closures (selectLineOnClicked) see the latest cache:
  const downloadedTextsRef = useRef(downloadedTexts);
  useEffect(() => { downloadedTextsRef.current = downloadedTexts; });
  const [toggle, setToggle] = useState(false);
  //const [searchParams] = useSearchParams();

  // Selected alignment for keyboard navigation (separate from focusedDataIndex which triggers text loading):
  const [selectedD, setSelectedD] = useState(null);
  const selectedDRef = useRef(null);
  useEffect(() => { selectedDRef.current = selectedD; }, [selectedD]);
  // Which book (1 or 2) is currently focused for left/right navigation:
  const focusedBookRef = useRef(1);
  // Last tooltip mouse position — reused when navigating with arrow keys:
  const tooltipPosRef = useRef({ layerX: 200, layerY: 50 });
  // Diff-load cancellation: each selectLineOnClicked call gets a generation; stale loads bail early.
  const diffLoadGenRef = useRef(0);
  // Debounce timer for diff loads triggered by arrow-key navigation.
  const diffLoadTimerRef = useRef(null);
  // Debounce timer that batches React state updates during keyboard navigation.
  const navTimerRef = useRef(null);
  // Tracks whether Shift is held while in zoom mode (for zoom-out cursor/behavior).
  const shiftPressedRef = useRef(false);
  // True after the first diff load; suppresses auto-scroll on subsequent arrow-key navigation.
  const diffShownRef = useRef(false);
  // Full SVG dimensions stored after setLayout so the viewBox crop can be applied without a full redraw.
  const svgFullHeightRef = useRef(0);
  const svgFullWidthRef  = useRef(0);
  // Always-current state for the TOC marker D3 closures:
  const tocMarkersStateRef = useRef({});
  tocMarkersStateRef.current = { exp1: expandedTocMarkers1, exp2: expandedTocMarkers2, sel1: selectedTocMarker1, sel2: selectedTocMarker2 };
  // Stable ref to drawTocMarkers so the expand-state useEffect can call the current closure:
  const drawTocMarkersRef = useRef(null);
  // Stable ref to panToTocMarker so the keyboard handler can pan to off-screen triangles:
  const panToTocMarkerRef = useRef(null);
  // Stable ref to zoomToTocSection so the keyboard handler can zoom to a section's range:
  const zoomToTocSectionRef = useRef(null);
  // Fetch TOC for each book (same URL pattern as MultiChart):
  useEffect(() => {
    setSelectedSections1(null);
    setExpandedTocMarkers1(new Set());
    setSelectedTocMarker1(null);
    const vc = metaData?.book1?.versionCode?.split("-")[0];
    if (!vc || !releaseCode) return;
    let cancelled = false;
    fetch(`https://raw.githubusercontent.com/OpenITI/openiti_toc/refs/heads/v${releaseCode}/tocs/${vc}_TOC.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled) setToc1(data); })
      .catch(() => { if (!cancelled) setToc1(null); });
    return () => { cancelled = true; };
  }, [metaData?.book1?.versionCode, releaseCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelectedSections2(null);
    setExpandedTocMarkers2(new Set());
    setSelectedTocMarker2(null);
    const vc = metaData?.book2?.versionCode?.split("-")[0];
    if (!vc || !releaseCode) return;
    let cancelled = false;
    fetch(`https://raw.githubusercontent.com/OpenITI/openiti_toc/refs/heads/v${releaseCode}/tocs/${vc}_TOC.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled) setToc2(data); })
      .catch(() => { if (!cancelled) setToc2(null); });
    return () => { cancelled = true; };
  }, [metaData?.book2?.versionCode, releaseCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Always-current refs for section highlights (used inside D3 closures):
  const tocHighlightRef = useRef({});
  tocHighlightRef.current = { toc1, toc2, sel1: selectedSections1, sel2: selectedSections2, isFlipped };

  // All datasets (unfiltered) for D3 rendering — zoom handles visibility via clip:
  const filteredDataSetsRef = useRef(chartData?.dataSets ?? []);
  filteredDataSetsRef.current = chartData?.dataSets ?? [];

  // Compute x-domain [min_ms, max_ms] from selected sections, or null for full view:
  const computeDomainFromSections = (toc, selectedSections) => {
    if (!selectedSections?.size || !toc?.sections) return null;
    const secs = Array.from(selectedSections).map(id => toc.sections[id]).filter(Boolean);
    if (!secs.length) return null;
    return [Math.max(0, Math.min(...secs.map(s => s.start_ms)) - 2),
                         Math.max(...secs.map(s => s.end_ms)) + 2];
  };

  // Zoom each panel to the selected section range when selections change:
  useEffect(() => {
    // Map sections → panel domains (respecting flip).
    // currentXDomain1/2 are render-scope vars; the value is consumed synchronously
    // by normalChart() below before any re-render can occur.
    currentXDomain1 = computeDomainFromSections(isFlipped ? toc2 : toc1, isFlipped ? selectedSections2 : selectedSections1); // eslint-disable-line react-hooks/exhaustive-deps
    currentXDomain2 = computeDomainFromSections(isFlipped ? toc1 : toc2, isFlipped ? selectedSections1 : selectedSections2); // eslint-disable-line react-hooks/exhaustive-deps
    normalChart(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [selectedSections1, selectedSections2]); // eslint-disable-line react-hooks/exhaustive-deps

  // navData is now built inside normalChart() using filteredDataSetsRef.
  const navDataRef = useRef(null);
  // Stable refs to functions that must be called from the keyboard handler:
  const clickToSelectRef = useRef(null);
  const selectLineOnClickedRef = useRef(null);
  const clearSelectedLineRef = useRef(null);
  const panToAlignmentRef = useRef(null);

  const [toolTip, setToolTip] = useState({
    isActive: false,
    layerX: 0,
    layerY: 0,
    sectionTitle: null,
    data: {
      book1: { ms: "", pos1: "", pos2: "" },
      book2: { ms: "", pos1: "", pos2: "" },
    },
  });
  const [secs1Open, setSecs1Open] = useState(true);
  const [secs2Open, setSecs2Open] = useState(true);

  //console.log(chartData);

  var clipPathId = "clipDrawing";
  var clipPath = "url('#clipDrawing')";

  var chartBox,
    svgD3,
    drawingG,
    marksG,
    clipRect,
    x0ScaleNode,
    x1ScaleNode,
    startOuterHeight = 530,
    outerHeight,
    outerWidth,
    innerHeight,
    innerWidth,
    width,
    height,
    max,
    refLinesData = null,
    hoverLines = [{}, {}],
    barWidth = 1.5,
    barMaxHeight = 150,
    chunkSize = 300,
    connColor = "#FFCC66",
    connHColor = "#ff9600",
    hoverStrokeWidth = 3,
    selectedLine = null;

  // set the dimensions and margins of the graph
  //var margin =  { top: 40, right: 20, bottom: 20, left: 60 };
  var padding = { top: 40, right: 0,  bottom: 40, left: 40 };

  // Fixed margin for the maximum possible TOC depth — keeps the SVG layout stable while
  // the user expands/collapses levels (viewBox crop handles the visual trimming instead).
  const pvmTop    = visMargins.top    + (includeTocMarkers ? getMaxDepth(isFlipped ? toc2 : toc1) : 0) * TOC_ROW_HEIGHT;
  const pvmBottom = visMargins.bottom + (includeTocMarkers ? getMaxDepth(isFlipped ? toc1 : toc2) : 0) * TOC_ROW_HEIGHT;

  var book1Bars, connections, book2Bars, brushG, brushG2, tocMarkersG;
  var xScale1, xScale2, xScaleIdentity, x0Axis, x1Axis;
  var y0Scale, y0Axis, y1Scale, y1Axis;
  var brushHandle1 = d3.brushX().on("end", brushEnded1);
  var brushHandle2 = d3.brushX().on("end", brushEnded2);

  var xIdentityDomain,
    currentXDomain1, currentXDomain2,
    duration1 = 700;

  let lastMs1 = Math.ceil(chartData?.tokens?.first / chunkSize);
  let lastMs2 = Math.ceil(chartData?.tokens?.second / chunkSize);
  // if the number of tokens is not found from the metadata, 
  // use the last milestone for which reuse was found as a proxy
  let showBookEnd1 = true;
  let showBookEnd2 = true;
  if (lastMs1 === 0) {
    console.log(chartData);
    lastMs1 = getHighestValueInArrayOfObjects(chartData.dataSets, "seq1");
    showBookEnd1 = false;
  }
  if (lastMs2 === 0) {
    lastMs2 = getHighestValueInArrayOfObjects(chartData.dataSets, "seq2");
    showBookEnd2 = false;
  }
  //console.log(`showBookEnd1: ${showBookEnd1}, showBookEnd2: ${showBookEnd2}`);


  var maxValues = {
    book1: isFlipped ? lastMs2 : lastMs1, //13000,
    book2: isFlipped ? lastMs1 : lastMs2, //13500,
    peak: Math.max(lastMs1, lastMs2), //13871,
  };

  /////////////// CHART HELPER FUNCTIONS: DRAWING ////////////////////

  function createChart() {
    chartBox = document.getElementById("chartBox");
    svgD3 = d3.select(document.getElementById("svgChart"));
    svgD3.selectAll("*").remove();
    svgD3.attr("class", "chartGroup");

    brushG  = svgD3.append("g").attr("class", "brush brush1");
    brushG2 = svgD3.append("g").attr("class", "brush brush2");
    brushGRef.current  = brushG;
    brushG2Ref.current = brushG2;
    tocMarkersG = svgD3.append("g").attr("class", "toc-markers");
    drawingG = svgD3
      .append("g")
      .attr("class", "drawing")
      .attr("clip-path", clipPath);
    marksG = svgD3.append("g").attr("class", "markings");

    book1Bars = drawingG.append("g").attr("id", "firstchart");
    connections = drawingG.append("g").attr("class", "connections");
    book2Bars = drawingG.append("g").attr("id", "secondchart");

    xScale1 = d3.scaleLinear();
    xScale2 = d3.scaleLinear();
    xScaleIdentity = d3.scaleLinear();
    y0Scale = d3.scaleLinear().domain([0, chunkSize]).range([0, barMaxHeight]);
    y1Scale = d3.scaleLinear().domain([0, chunkSize]).range([0, barMaxHeight]);
    y0Axis = d3.axisLeft(y0Scale).ticks(5);
    y1Axis = d3.axisLeft(y1Scale).ticks(5);

    // - Book1 xAxis Scale::
    x0ScaleNode = marksG
      .append("g")
      .attr("class", "x0 axis")
      .attr("transform", "translate(0," + barMaxHeight + ")");

    // - Book2 xAxis Scale::
    x1ScaleNode = marksG
      .append("g")
      .attr("class", "x1 axis")
      .attr("transform", "translate(0," + barMaxHeight * 2 + ")");

    // - Book1 yAxis Scale::
    marksG.append("g").attr("class", "y0 axis").call(y0Axis);

    // - Book2 xAxis Scale::
    marksG
      .append("g")
      .attr("class", "y1 axis")
      .call(y1Axis)
      .attr("transform", "translate(0," + barMaxHeight * 2 + ")");

    // - Clip Path (Masking) ::
    clipRect = svgD3
      .append("defs")
      .append("clipPath")
      .attr("id", clipPathId)
      .append("rect");
  }

  function setLayout() {
    outerWidth = chartBox.offsetWidth;
    innerWidth = outerWidth - visMargins.left - visMargins.right;
    //const minMargin = Math.max(axisLabelFontSize, tickFontSize);
    outerHeight = startOuterHeight + pvmTop + pvmBottom - defaultMargins.top - defaultMargins.bottom;
    //outerHeight = startOuterHeight
    innerHeight = outerHeight - pvmTop - pvmBottom;
    width = innerWidth - padding.left - padding.right;
    height = innerHeight - 20;
    //height = innerHeight;
    console.log(`outerWidth: ${outerWidth}`);
    console.log(`innerWidth: ${innerWidth}`);
    console.log(`outerHeight: ${outerHeight}`);
    console.log(`innerHeight: ${innerHeight}`);
    console.log(`width: ${width}`);
    console.log(`height: ${height}`);
    console.log(visMargins);

    svgD3.attr("width", outerWidth - 30).attr("height", outerHeight);
    svgFullHeightRef.current = outerHeight;
    svgFullWidthRef.current  = outerWidth - 30;

    drawingG.attr(
      "transform",
      "translate(" + visMargins.left + "," + pvmTop + ")"
    );
    brushG.attr(
      "transform",
      "translate(" + visMargins.left + "," + pvmTop + ")"
    );
    brushG2.attr(
      "transform",
      "translate(" + visMargins.left + "," + pvmTop + ")"
    );
    marksG.attr(
      "transform",
      "translate(" + visMargins.left + "," + pvmTop + ")"
    );
    tocMarkersG.attr(
      "transform",
      "translate(" + visMargins.left + "," + pvmTop + ")"
    );
    book2Bars.attr("transform", "translate(0,300)");

    clipRect.attr("width", width).attr("height", height);
    // --- Set Scales on Basis of the chartData ::

    max = maxValues;
    xIdentityDomain = [0, max.peak];
    currentXDomain1 = currentXDomain1 || xIdentityDomain;
    currentXDomain2 = currentXDomain2 || xIdentityDomain;
    xScale1.domain(currentXDomain1).range([1, width - 1]);
    xScale2.domain(currentXDomain2).range([1, width - 1]);
    xScaleIdentity.domain(xIdentityDomain).range([1, width - 1]);
    x0Axis = d3.axisBottom(xScale1);
    x1Axis = d3.axisTop(xScale2).tickValues([1, max.book2]);
    // Brush extents follow the book reference lines (start=0, end=max.book).
    // Function form so re-calling the brush recalculates with the current scale.
    brushHandle1.extent(() => [
      [Math.max(0, xScale1(0)),         0],
      [Math.min(width, xScale1(max.book1)), barMaxHeight],
    ]);
    brushHandle2.extent(() => [
      [Math.max(0, xScale2(0)),         barMaxHeight * 2],
      [Math.min(width, xScale2(max.book2)), barMaxHeight * 3],
    ]);
    refLinesData = [
      { x: 0,          y: 0,             yScale: y0Scale, solid: true,         xS: xScale1 },
      { x: max.book1,  y: 0,             yScale: y0Scale, solid: showBookEnd1,  xS: xScale1 },
      { x: 0,          y: barMaxHeight*2, yScale: y1Scale, solid: true,         xS: xScale2 },
      { x: max.book2,  y: barMaxHeight*2, yScale: y1Scale, solid: showBookEnd2, xS: xScale2 },
    ];

    hoverLines = [
      { x: barMaxHeight, y: 0,             yScale: y0Scale, visible: false, xS: xScale1 },
      { x: barMaxHeight, y: barMaxHeight*2, yScale: y0Scale, visible: false, xS: xScale2 },
    ];

    // update the tick font size: 
    d3.selectAll("#chartBox .axis .tick text")
      .style("font-size", `${tickFontSize}px`);

    // update the margins of the graph:

  }


  function drawChart() {
    // - Hover Lines ::
    drawingG
      .selectAll(".dotted-bar-lines")
      .data(hoverLines)
      .enter()
      .insert("line", ":first-child")
      .attr("clip-path", clipPath)
      .attr("class", "dotted-bar-lines")
      .attr("opacity", 0);

    // --- Draw Book1 Bar Chart [START] :::
    var book1BarNodes = book1Bars.selectAll(".bar").data(filteredDataSetsRef.current);

    book1BarNodes
      .enter()
      .append("line")
      .attr("class", "bar")
      .attr("stroke-width", barWidth);

    book1BarNodes.exit().remove();
    // --- Draw Book1 Bar Chart [END] :::

    // --- Draw Connections Curves [START] :::
    var connectionNodes = connections
      .selectAll("path")
      .data(filteredDataSetsRef.current);

    connectionNodes
      .enter()
      .append("path")
      .attr("class", "connection")
      .attr("stroke", connColor)
      .attr("stroke-width", 1.5)
      .attr("fill", "none");

    connectionNodes.exit().remove();
    // --- Draw Connections Curves [END] :::

    // --- Draw Book2 Bar Chart [START] :::
    var book2BarNodes = book2Bars
      .selectAll(".bar")
      .data(filteredDataSetsRef.current)
      .enter()
      .append("line")
      .attr("class", "bar")
      .attr("stroke-width", barWidth);

    book2BarNodes
      .enter()
      .append("line")
      .attr("class", "bar")
      .attr("stroke-width", barWidth);

    book2BarNodes.exit().remove();
    // --- Draw Book2 Bar Chart [END] :::

    // - Append Brushes (one per panel)
    brushG.call(brushHandle1);
    brushG2.call(brushHandle2);
    applyBrushCursor();

    // - Max Marking ::
    marksG
      .selectAll(".max-reference-lines")
      .data(refLinesData)
      .enter()
      .append("line")
      .attr("clip-path", clipPath)
      .attr("class", d => d.solid ? "max-reference-lines" : "max-reference-lines dashed");
  }

  function updateChart(duration) {
    drawingG?.selectAll("*").interrupt();
    var t = svgD3.transition().duration(duration || 0);

    // - render Bars of Book1 and Book2 ::
    book1Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 1); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("x1", function (d) {
        return xScale1(Number(d.seq1));
      })
      .attr("x2", function (d) {
        return xScale1(Number(d.seq1));
      })
      .attr("y1", function (d) {
        return y0Scale(Number(d.bw1));
      })
      .attr("y2", function (d) {
        return y0Scale(Number(d.ew1));
      });

    // - render Connection Curves ::
    connections
      .selectAll("path")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 1); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("d", function (d) {
        return (
          "M " + xScale1(Number(d.seq1)) + " 150 C " +
          xScale1(Number(d.seq1)) + " 250," +
          xScale2(Number(d.seq2)) + " 220 , " +
          xScale2(Number(d.seq2)) + " 300"
        );
      });

    // - render Bars of Book2 ::
    book2Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 2); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("x1", function (d) {
        return xScale2(Number(d.seq2));
      })
      .attr("x2", function (d) {
        return xScale2(Number(d.seq2));
      })
      .attr("y1", function (d) {
        return y1Scale(Number(d.bw2));
      })
      .attr("y2", function (d) {
        return y1Scale(Number(d.ew2));
      });

    // - render X Axis of Book1 ::
    x0Axis.tickValues(getTickValues(
      currentXDomain1, max.book1,
      selectedLine ? Number(selectedLine.seq1) : undefined,
      showBookEnd1 ? max.book1 : undefined
    ));
    x0ScaleNode
      .transition(t)
      .call(x0Axis)
      .selectAll("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("font-size", `${tickFontSize}px`);

    // - render X Axis of Book2 ::
    x1Axis.tickValues(getTickValues(
      currentXDomain2, max.book2,
      selectedLine ? Number(selectedLine.seq2) : undefined,
      showBookEnd2 ? max.book2 : undefined
    ));
    x1ScaleNode
      .transition(t)
      .call(x1Axis)
      .selectAll("text")
      .attr("x", 5)
      .attr("y", 2)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "start")
      .style("font-size", `${tickFontSize}px`);

    // - render Reference Lines Min and Max ::
    marksG
      .selectAll(".max-reference-lines")
      .transition(t)
      .attr("x1", function (d) {
        return d.xS(d.x);
      })
      .attr("x2", function (d) {
        return d.xS(d.x);
      })
      .attr("y1", function (d) {
        return d.yScale(0) + d.y;
      })
      .attr("y2", function (d) {
        return d.yScale(chunkSize) + d.y;
      });

    // Re-assert selection dimming and highlight after zoom/flip:
    if (selectedLine) {
      getConnections().filter(d => d !== selectedLine).attr("opacity", 0.1);
      getBars().filter(d => d !== selectedLine).attr("opacity", 0.1);
      filterSelected(selectedLine, getConnections())
        .attr("stroke", connHColor).attr("stroke-width", hoverStrokeWidth).attr("opacity", null);
      filterSelected(selectedLine, getBars())
        .attr("stroke-width", hoverStrokeWidth).attr("opacity", null);
    }

    // Per-section highlight rectangles with tooltip on hover:
    { const { sel1, sel2, toc1: t1, toc2: t2 } = tocHighlightRef.current;
      drawingG.selectAll(".section-bg").remove();
      const drawSections = (scale, toc, sels, yOff) => {
        if (!sels?.size || !toc?.sections) return;
        Array.from(sels).forEach(id => {
          const sec = toc.sections[id]; if (!sec) return;
          const x1 = scale(sec.start_ms), x2 = scale(sec.end_ms), w = x2 - x1;
          if (w <= 0) return;
          drawingG.insert("rect", ":first-child").attr("class", "section-bg")
            .attr("x", x1).attr("y", yOff).attr("width", w).attr("height", barMaxHeight)
            .attr("fill", "rgba(100,160,230,0.18)").attr("pointer-events", "all")
            .on("mouseover", (ev) => setToolTip(p => ({
              ...p, isActive: true, layerX: ev.layerX, layerY: ev.layerY,
              sectionTitle: getSectionHierarchy(toc, id),
            })))
            .on("mouseout", () => setToolTip(p => ({ ...p, isActive: false, sectionTitle: null })));
        });
      };
      drawSections(xScale1, t1, sel1, 0);
      drawSections(xScale2, t2, sel2, barMaxHeight * 2);
    }

    drawTocMarkers();
    // Reposition brush overlays to match the current scale (extent is function-based):
    brushG.call(brushHandle1);
    brushG2.call(brushHandle2);
    applyBrushCursor();
    if (zoomModeRef.current) { brushG.raise(); brushG2.raise(); }
    return t;
  }

  function flipChart(duration) {
    drawingG?.selectAll("*").interrupt();
    var t = svgD3.transition().duration(duration || 0);

    // - render Bars of Book1 and Book2 ::
    book1Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 2); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("x1", function (d) {
        return xScale1(Number(d.seq2));
      })
      .attr("x2", function (d) {
        return xScale1(Number(d.seq2));
      })
      .attr("y1", function (d) {
        return y0Scale(Number(d.bw2));
      })
      .attr("y2", function (d) {
        return y0Scale(Number(d.ew2));
      });

    // - render Connection Curves ::
    connections
      .selectAll("path")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 1); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("d", function (d) {
        return (
          "M " + xScale1(Number(d.seq2)) + " 150 C " +
          xScale1(Number(d.seq2)) + " 250," +
          xScale2(Number(d.seq1)) + " 220 , " +
          xScale2(Number(d.seq1)) + " " + chunkSize
        );
      });

    // - render Bars of Book2 ::
    book2Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => { e.stopPropagation(); clickToSelect(e, d, 1); panToAlignmentRef.current?.(d); })
      .on("dblclick", (e, d) => { e.stopPropagation(); selectLineOnClicked(e, d); })
      .transition(t)
      .attr("x1", function (d) {
        return xScale2(Number(d.seq1));
      })
      .attr("x2", function (d) {
        return xScale2(Number(d.seq1));
      })
      .attr("y1", function (d) {
        return y1Scale(Number(d.bw1));
      })
      .attr("y2", function (d) {
        return y1Scale(Number(d.ew1));
      });

    // - render X Axis of Book1 ::
    x0Axis.tickValues(getTickValues(
      currentXDomain1, max.book1,
      selectedLine ? Number(isFlipped ? selectedLine.seq2 : selectedLine.seq1) : undefined,
      showBookEnd2 ? max.book1 : undefined   // flipped: top panel shows book2
    ));
    x0ScaleNode
      .transition(t)
      .call(x0Axis)
      .selectAll("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    // - render X Axis of Book2 ::
    x1Axis.tickValues(getTickValues(
      currentXDomain2, max.book2,
      selectedLine ? Number(isFlipped ? selectedLine.seq1 : selectedLine.seq2) : undefined,
      showBookEnd1 ? max.book2 : undefined   // flipped: bottom panel shows book1
    ));
    x1ScaleNode
      .transition(t)
      .call(x1Axis)
      .selectAll("text")
      .attr("x", 5)
      .attr("y", 2)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "start");

    // - render Reference Lines Min and Max ::
    marksG
      .selectAll(".max-reference-lines")
      .transition(t)
      .attr("x1", function (d) {
        return d.xS(d.x);
      })
      .attr("x2", function (d) {
        return d.xS(d.x);
      })
      .attr("y1", function (d) {
        return d.yScale(0) + d.y;
      })
      .attr("y2", function (d) {
        return d.yScale(chunkSize) + d.y;
      });

    // Re-assert selection dimming after zoom/flip:
    if (selectedLine) {
      getConnections().filter(d => d !== selectedLine).attr("opacity", 0.1);
      getBars().filter(d => d !== selectedLine).attr("opacity", 0.1);
    }

    // Per-section highlight rectangles (flipped: top=book2/sel2, bottom=book1/sel1):
    { const { sel1, sel2, toc1: t1, toc2: t2 } = tocHighlightRef.current;
      drawingG.selectAll(".section-bg").remove();
      const drawSections = (scale, toc, sels, yOff) => {
        if (!sels?.size || !toc?.sections) return;
        Array.from(sels).forEach(id => {
          const sec = toc.sections[id]; if (!sec) return;
          const x1 = scale(sec.start_ms), x2 = scale(sec.end_ms), w = x2 - x1;
          if (w <= 0) return;
          drawingG.insert("rect", ":first-child").attr("class", "section-bg")
            .attr("x", x1).attr("y", yOff).attr("width", w).attr("height", barMaxHeight)
            .attr("fill", "rgba(100,160,230,0.18)").attr("pointer-events", "all")
            .on("mouseover", (ev) => setToolTip(p => ({
              ...p, isActive: true, layerX: ev.layerX, layerY: ev.layerY,
              sectionTitle: getSectionHierarchy(toc, id),
            })))
            .on("mouseout", () => setToolTip(p => ({ ...p, isActive: false, sectionTitle: null })));
        });
      };
      drawSections(xScale1, t2, sel2, 0);              // flipped: top = book2
      drawSections(xScale2, t1, sel1, barMaxHeight * 2); // flipped: bottom = book1
    }

    drawTocMarkers();
    // Reposition brush overlays to match the current scale (extent is function-based):
    brushG.call(brushHandle1);
    brushG2.call(brushHandle2);
    applyBrushCursor();
    if (zoomModeRef.current) { brushG.raise(); brushG2.raise(); }
    return t;
  }

  /////////////// CHART HELPER FUNCTIONS: INTERACTIONS ////////////////////

  // Force cursor as CSS style so it wins over D3's SVG cursor attribute.
  function applyBrushCursor() {
    if (!zoomModeRef.current) return;
    const cur = shiftPressedRef.current ? "zoom-out" : "zoom-in";
    brushG?.select(".overlay").style("cursor", cur);
    brushG2?.select(".overlay").style("cursor", cur);
  }

  function zoomOutDomain(scale, identityDomain, bookMax, sel, sourceEvent) {
    // Compute a 2× zoom-out centered on the midpoint of the brush/click.
    const [px] = sel ? [(sel[0] + sel[1]) / 2] : [d3.pointer(sourceEvent, brushG.node())[0]];
    const midMs   = scale.invert(px);
    const curDomain = scale.domain();
    const curSpan   = curDomain[1] - curDomain[0];
    const fullSpan  = identityDomain[1] - identityDomain[0];
    const newSpan   = Math.min(curSpan * 2, fullSpan);
    if (newSpan >= fullSpan) return null; // already at full range → reset
    const rawMin = midMs - newSpan / 2;
    const newMin = Math.max(0, rawMin);
    const newMax = Math.min(bookMax, newMin + newSpan);
    return [newMax === bookMax ? Math.max(0, bookMax - newSpan) : newMin, newMax];
  }

  // Find the data point whose x position on the given scale is closest to targetPx.
  function nearestBar(scale, getMs, targetPx) {
    const data = filteredDataSetsRef.current;
    if (!data.length) return null;
    return data.reduce((best, d) => {
      const dist = Math.abs(scale(Number(getMs(d))) - targetPx);
      return dist < Math.abs(scale(Number(getMs(best))) - targetPx) ? d : best;
    });
  }

  function brushEnded1(e) {
    if (!e.sourceEvent) return;
    var sel = e.selection;

    if (!zoomModeRef.current) {
      // Normal mode: drag to select nearest bar, click-in-empty-space to deselect.
      const getMs = d => isFlipped ? d.seq2 : d.seq1;
      const bookNum = isFlipped ? 2 : 1;
      if (sel) {
        const mid = (sel[0] + sel[1]) / 2;
        const data = filteredDataSetsRef.current;
        // Prefer a bar inside the dragged range; fall back to nearest overall.
        const inRange = data.filter(d => {
          const x = xScale1(Number(getMs(d)));
          return x >= sel[0] && x <= sel[1];
        });
        const target = inRange.length
          ? inRange.reduce((a, b) => Math.abs(xScale1(Number(getMs(a))) - mid) <= Math.abs(xScale1(Number(getMs(b))) - mid) ? a : b)
          : nearestBar(xScale1, getMs, mid);
        if (target) { clickToSelect(null, target, bookNum); panToAlignment(target); }
      } else {
        clearSelectedLine(); // click in empty space → deselect
      }
      brushG.call(brushHandle1.move, null);
      return;
    }

    if (e.sourceEvent.shiftKey) {
      const newDomain = zoomOutDomain(xScale1, xIdentityDomain, max.book1, sel, e.sourceEvent);
      currentXDomain1 = newDomain; // null = full reset handled in setLayout
      xScale1.domain(newDomain || xIdentityDomain);
    } else {
      if (!sel) {
        // Click without drag: zoom in 2× centered on click position.
        const [px] = d3.pointer(e.sourceEvent, brushG.node());
        const mid = xScale1.invert(px);
        const span = Math.max((xScale1.domain()[1] - xScale1.domain()[0]) / 2, 1);
        const lo = Math.max(0, mid - span / 2);
        const hi = Math.min(max.book1, lo + span);
        currentXDomain1 = [hi === max.book1 ? Math.max(0, max.book1 - span) : lo, hi];
        xScale1.domain(currentXDomain1);
      } else {
        currentXDomain1 = sel.map(d => Math.max(0, Math.round(xScale1.invert(d))));
        xScale1.domain(currentXDomain1);
      }
    }
    zoom();
  }

  function brushEnded2(e) {
    if (!e.sourceEvent) return;
    var sel = e.selection;

    if (!zoomModeRef.current) {
      const getMs = d => isFlipped ? d.seq1 : d.seq2;
      const bookNum = isFlipped ? 1 : 2;
      if (sel) {
        const mid = (sel[0] + sel[1]) / 2;
        const data = filteredDataSetsRef.current;
        const inRange = data.filter(d => {
          const x = xScale2(Number(getMs(d)));
          return x >= sel[0] && x <= sel[1];
        });
        const target = inRange.length
          ? inRange.reduce((a, b) => Math.abs(xScale2(Number(getMs(a))) - mid) <= Math.abs(xScale2(Number(getMs(b))) - mid) ? a : b)
          : nearestBar(xScale2, getMs, mid);
        if (target) { clickToSelect(null, target, bookNum); panToAlignment(target); }
      } else {
        clearSelectedLine();
      }
      brushG2.call(brushHandle2.move, null);
      return;
    }

    if (e.sourceEvent.shiftKey) {
      const newDomain = zoomOutDomain(xScale2, xIdentityDomain, max.book2, sel, e.sourceEvent);
      currentXDomain2 = newDomain;
      xScale2.domain(newDomain || xIdentityDomain);
    } else {
      if (!sel) {
        // Click without drag: zoom in 2× centered on click position.
        const [px] = d3.pointer(e.sourceEvent, brushG2.node());
        const mid = xScale2.invert(px);
        const span = Math.max((xScale2.domain()[1] - xScale2.domain()[0]) / 2, 1);
        const lo = Math.max(0, mid - span / 2);
        const hi = Math.min(max.book2, lo + span);
        currentXDomain2 = [hi === max.book2 ? Math.max(0, max.book2 - span) : lo, hi];
        xScale2.domain(currentXDomain2);
      } else {
        currentXDomain2 = sel.map(d => Math.max(0, Math.round(xScale2.invert(d))));
        xScale2.domain(currentXDomain2);
      }
    }
    zoom();
  }

  function restoreCanvas() {
    selectedLine = null;
    setFocusedDataIndex(null);
    setSelectedD(null);
    selectedDRef.current = null;
    currentXDomain1 = null;
    currentXDomain2 = null;
    setSelectedSections1(null);
    setSelectedSections2(null);
    setExpandedTocMarkers1(new Set());
    setExpandedTocMarkers2(new Set());
    setSelectedTocMarker1(null);
    setSelectedTocMarker2(null);
    activeTocPanelRef.current = null;
    diffShownRef.current = false;
    setToolTip({ isActive: false, layerX: 0, layerY: 0,
      data: { book1: { ms: "", pos1: "", pos2: "" }, book2: { ms: "", pos1: "", pos2: "" } } });
    normalChart();
    brushG.call(brushHandle1.move, null);
    brushG2.call(brushHandle2.move, null);
  }

  function zoom() {
    brushG.call(brushHandle1.move, null);
    brushG2.call(brushHandle2.move, null);
    isFlipped ? flipChart(duration1) : updateChart(duration1);
  }

  // Returns tick values for an axis: when zoomed, show first+last visible milestone;
  // when full view, show 1 and max; always include selectedVal if it's in range.
  function getTickValues(domain, fullMax, selectedVal, bookEnd) {
    const first = domain ? Math.ceil(domain[0])  : 1;
    const last  = domain ? Math.min(Math.floor(domain[1]), fullMax) : fullMax;
    const extras = [];
    // Show the book-end line position as a tick when it is within the visible range:
    if (bookEnd !== undefined && bookEnd > first && bookEnd < last) extras.push(bookEnd);
    // Show the selected alignment's position as a tick:
    if (selectedVal !== undefined && selectedVal > first && selectedVal < last) extras.push(selectedVal);
    return [...new Set([first, ...extras, last])].sort((a, b) => a - b);
  }

  // Pan a single panel if its alignment position is off-screen.
  // Returns true if a pan was needed.
  function _panPanel(d1, panBook) {
    const val = panBook === 1
      ? Number(isFlipped ? d1.seq2 : d1.seq1)
      : Number(isFlipped ? d1.seq1 : d1.seq2);
    const domain = panBook === 1 ? currentXDomain1 : currentXDomain2;
    if (!domain) return false;
    if (val >= domain[0] && val <= domain[1]) return false;
    const span = domain[1] - domain[0];
    const min = Math.max(0, val - span / 2);
    const newDomain = [min, min + span];
    if (panBook === 1) { currentXDomain1 = newDomain; xScale1.domain(newDomain); }
    else               { currentXDomain2 = newDomain; xScale2.domain(newDomain); }
    return true;
  }

  // Pan both panels as needed, then redraw — with animation if panning, instant if not
  // Lightweight tick-label update — skips bars, connections, and reference lines.
  function updateTickLabels() {
    if (!x0ScaleNode || !x1ScaleNode) return;
    const sel1 = selectedLine ? Number(isFlipped ? selectedLine.seq2 : selectedLine.seq1) : undefined;
    const sel2 = selectedLine ? Number(isFlipped ? selectedLine.seq1 : selectedLine.seq2) : undefined;
    x0Axis.tickValues(getTickValues(currentXDomain1, max.book1, sel1,
      (isFlipped ? showBookEnd2 : showBookEnd1) ? max.book1 : undefined));
    x0ScaleNode.call(x0Axis).selectAll("text")
      .attr("x", -5).attr("y", -5).attr("transform", "rotate(-90)")
      .style("text-anchor", "end").style("font-size", `${tickFontSize}px`);
    x1Axis.tickValues(getTickValues(currentXDomain2, max.book2, sel2,
      (isFlipped ? showBookEnd1 : showBookEnd2) ? max.book2 : undefined));
    x1ScaleNode.call(x1Axis).selectAll("text")
      .attr("x", 5).attr("y", 2).attr("transform", "rotate(-90)")
      .style("text-anchor", "start").style("font-size", `${tickFontSize}px`);
  }

  function drawTocMarkers() {
    if (!tocMarkersG) return;
    tocMarkersG.selectAll("*").remove();
    if (!includeTocMarkersRef.current) return;

    const { exp1, exp2, sel1, sel2 } = tocMarkersStateRef.current;
    const { toc1: t1, toc2: t2 } = tocHighlightRef.current;
    const topToc    = isFlipped ? t2 : t1;
    const botToc    = isFlipped ? t1 : t2;
    const topExp    = isFlipped ? exp2 : exp1;
    const botExp    = isFlipped ? exp1 : exp2;
    const topSel    = isFlipped ? sel2 : sel1;   // selected section in top panel
    const botSel    = isFlipped ? sel1 : sel2;   // selected section in bottom panel
    const setTopExp = isFlipped ? setExpandedTocMarkers2 : setExpandedTocMarkers1;
    const setBotExp = isFlipped ? setExpandedTocMarkers1 : setExpandedTocMarkers2;
    const setTopSel = isFlipped ? setSelectedTocMarker2 : setSelectedTocMarker1;
    const setBotSel = isFlipped ? setSelectedTocMarker1 : setSelectedTocMarker2;

    const rowHeight = TOC_ROW_HEIGHT;
    const triSize   = 5;

    function hasChildren(toc, id) {
      return Object.values(toc.sections).some(s => String(s.parent) === String(id));
    }

    // Draw one row of triangles. inverted=true → up-pointing (bottom panel).
    function drawRow(toc, ids, scale, yCenter, inverted, expanded, setExpanded, selectedId, setSelectedId) {
      ids.forEach(id => {
        const sec = toc.sections[id];
        if (!sec) return;
        const x = scale(sec.start_ms);
        if (x < -triSize || x > width + triSize) return;
        const isExpanded = expanded.has(id);
        const isSelected = selectedId === id;
        const canExpand  = hasChildren(toc, id);
        const path = inverted
          ? `M ${-triSize},${triSize} L ${triSize},${triSize} L 0,${-triSize} Z`
          : `M ${-triSize},${-triSize} L ${triSize},${-triSize} L 0,${triSize} Z`;
        const g = tocMarkersG.append("g")
          .attr("transform", `translate(${x},${yCenter})`)
          .attr("data-toc-id", id)
          .attr("cursor", "pointer");
        g.append("path")
          .attr("d", path)
          .attr("fill", isExpanded ? "#2862a5" : "#4a90d9")
          .attr("fill-opacity", isSelected ? 1 : (canExpand ? 0.85 : 0.4))
          .attr("stroke", isSelected ? "black" : "none")
          .attr("stroke-width", isSelected ? 2 : 0);
        g.on("click", (e) => {
          e.stopPropagation(); // prevent SVG click from clearing the bar selection
          // Select this triangle:
          setSelectedId(id);
          activeTocPanelRef.current = inverted ? 'bottom' : 'top';
          // Expand/collapse if it has children:
          if (canExpand) {
            setExpanded(prev => {
              const next = new Set(prev);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            });
          }
        });
        g.on("mouseover", (ev) => setToolTip(p => ({
          ...p, isActive: true, layerX: ev.layerX, layerY: ev.layerY,
          sectionTitle: getSectionHierarchy(toc, id),
        })));
        g.on("mouseout", () => setToolTip(p => ({ ...p, isActive: false, sectionTitle: null })));
      });
    }

    // Top panel: deepest visible level anchored just above bars (y = −rowHeight/2).
    // Each expansion shifts all rows upward — pvmTop is sized to always fit maxDepth rows.
    if (topToc) {
      const rows = getRows(topToc, topExp);
      const numRows = rows.length;
      rows.forEach((ids, rowIndex) => {
        const yCenter = -(numRows - rowIndex - 0.5) * rowHeight;
        drawRow(topToc, ids, xScale1, yCenter, false, topExp, setTopExp, topSel, setTopSel);
      });
    }

    // Bottom panel: same logic inverted — deepest level just below bars, roots shift down.
    if (botToc) {
      const barBottom = barMaxHeight * 3;
      const rows = getRows(botToc, botExp);
      const numRows = rows.length;
      rows.forEach((ids, rowIndex) => {
        const yCenter = barBottom + (numRows - rowIndex - 0.5) * rowHeight;
        drawRow(botToc, ids, xScale2, yCenter, true, botExp, setBotExp, botSel, setBotSel);
      });
    }
  }

  // Zoom the appropriate panel to show exactly a section's milestone range.
  function zoomToTocSection(toc, sectionId, useTop) {
    const sec = toc?.sections?.[sectionId];
    if (!sec || sec.start_ms == null) return;
    const newDomain = [Math.max(0, sec.start_ms - 2), (sec.end_ms ?? sec.start_ms) + 2];
    if (useTop) { currentXDomain1 = newDomain; xScale1.domain(newDomain); }
    else        { currentXDomain2 = newDomain; xScale2.domain(newDomain); }
    zoom();
  }

  // Pan the appropriate panel so a TOC triangle at `sectionId` is visible.
  // useTop=true → top panel (xScale1/currentXDomain1), false → bottom (xScale2/currentXDomain2).
  function panToTocMarker(toc, sectionId, useTop) {
    const sec = toc?.sections?.[sectionId];
    if (!sec) return;
    const ms    = sec.start_ms;
    const scale = useTop ? xScale1 : xScale2;
    const px    = scale(ms);
    if (px >= 0 && px <= width) return; // already visible
    const domain   = scale.domain();
    const span     = domain[1] - domain[0];
    const bookMax  = useTop ? max.book1 : max.book2;
    const newMin   = Math.max(0, ms - span / 2);
    const newMax   = Math.min(bookMax, newMin + span);
    const adjMin   = newMax === bookMax ? Math.max(0, bookMax - span) : newMin;
    const newDomain = [adjMin, newMax];
    if (useTop) { currentXDomain1 = newDomain; xScale1.domain(newDomain); }
    else        { currentXDomain2 = newDomain; xScale2.domain(newDomain); }
    zoom();
  }

  function panToAlignment(d1) {
    const moved1 = _panPanel(d1, 1);
    const moved2 = _panPanel(d1, 2);
    if (moved1 || moved2) {
      zoom(); // animated pan
    } else {
      updateTickLabels(); // just refresh the milestone tick marks
    }
  }

  function focusOnLine(d1) {
    var pad = xScaleIdentity.invert(5);
    var s1 = Number(isFlipped ? d1.seq2 : d1.seq1);
    var s2 = Number(isFlipped ? d1.seq1 : d1.seq2);
    currentXDomain1 = [Math.max(0, s1 - pad), s1 + pad];
    currentXDomain2 = [Math.max(0, s2 - pad), s2 + pad];
    xScale1.domain(currentXDomain1);
    xScale2.domain(currentXDomain2);
    zoom();
  }

  function getConnections() {
    return connections.selectAll("path");
  }
  function getBars() {
    return drawingG.selectAll("#firstchart .bar, #secondchart .bar");
  }
  function filterSelected(d1, nodesD3) {
    return nodesD3.filter(function (d) {
      return d === d1;
    });
  }

  function mouseOver(e, d1, skipTooltip = false) {
    if (zoomModeRef.current) return;
    // Suppress hover tooltip for non-selected bars when a selection is active:
    if (e && selectedDRef.current && d1 !== selectedDRef.current) return;
    // set data to tooltip
    const pos = e ? { layerX: e.layerX, layerY: e.layerY } : tooltipPosRef.current;
    if (e) tooltipPosRef.current = pos;
    if (!skipTooltip) setToolTip({
      isActive: true,
      layerX: pos.layerX,
      layerY: pos.layerY,
      isSelected: !!(selectedDRef.current && d1 === selectedDRef.current),
      data: {
        book1: { ms: d1?.seq1, pos1: d1?.bw1, pos2: d1?.ew1 },
        book2: { ms: d1?.seq2, pos1: d1?.bw2, pos2: d1?.ew2 },
      },
    });

    filterSelected(d1, getConnections())
      .attr("stroke", connHColor)
      .attr("stroke-width", hoverStrokeWidth)
      .attr("opacity", null);
    filterSelected(d1, getBars())
      .attr("stroke-width", hoverStrokeWidth)
      .attr("opacity", null);
    // - render Dotted Bars for book1 and book2 on hover/click ::
    hoverLines[0].x = Number(isFlipped ? d1.seq2 : d1.seq1);
    hoverLines[1].x = Number(isFlipped ? d1.seq1 : d1.seq2);
    drawingG
      .selectAll(".dotted-bar-lines")
      .attr("x1", function (d) {
        return d.xS(d.x);
      })
      .attr("x2", function (d) {
        return d.xS(d.x);
      })
      .attr("y1", function (d) {
        return d.yScale(0) + d.y;
      })
      .attr("y2", function (d) {
        return d.yScale(chunkSize) + d.y;
      })
      .attr("opacity", null);
  }

  function mouseOut(e, d1) {
    // When any selection is active, always restore the selection state —
    // never let mouseOut reset the stroke-width of the selected bar:
    if (selectedDRef.current) {
      mouseOver(null, selectedDRef.current);
      return;
    }
    // clear data from tooltip
    setToolTip({
      isActive: false,
      layerX: 0,
      layerY: 0,
      data: {
        book1: { ms: "", pos1: "", pos2: "" },
        book2: { ms: "", pos1: "", pos2: "" },
      },
    });
    if (selectedLine === d1) return;

    filterSelected(d1, getConnections())
      .transition()
      .attr("stroke", connColor)
      .attr("stroke-width", 1.5)
      .attr("opacity", opacityOnMouseOut);

    filterSelected(d1, getBars())
      .transition()
      .attr("stroke-width", barWidth)
      .attr("opacity", opacityOnMouseOut);

    drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);

    function opacityOnMouseOut(d) {
      return d.hidden && selectedLine ? 0.1 : null;
    }
  }

  // t3
  async function selectLineOnClicked(e, d1) {
    const myGen = ++diffLoadGenRef.current;
    // Ensure the selection state is consistent when called via double-click or keyboard Enter:
    if (d1 !== selectedLine) clickToSelect(e, d1);
    setFocusedDataIndex(null);
    const versionCode1 = metaData?.book1?.versionCode;
    const versionCode2 = metaData?.book2?.versionCode;
    // store the index of the selected alignment in the context:
    for (let i = 0; i < chartData.dataSets.length; i++) {
      if (
        chartData.dataSets[i].seq1 === d1.seq1 &&
        chartData.dataSets[i].seq2 === d1.seq2
      ) {
        setFocusedDataIndex(i);
        break;
      }
    }

    // Get the relevant milestones
    // (from the already downloaded milestones or from GitHub)
    
    // check if there is a link for the original text:
    if (metaData?.book1?.url === "NOT_FOUND" || metaData?.book1?.url === undefined || metaData?.book1 === undefined ) {
      // if there isn't, we can't get text from an external source, 
      // only from the uploaded csv file itself
      console.log("no metadata => can't get milestone text from API!");
      setTextAvailable(false);

      setBooks({
        book1: {
          versionCode: versionCode1,
          title: metaData?.book1?.bookTitle?.label,
          content: [],
          ms: d1?.seq1,
        },
        book2: {
          versionCode: versionCode2,
          title: metaData?.book2?.bookTitle?.label,
          content: [],
          ms: d1?.seq2,
        },
      });

      // reset the milestones to be displayed in the reader:
      setDisplayMs({ book1: {}, book2: {} });

      setBooksAlignment([{
        s1: d1?.s1,
        s2: d1?.s2,
        bw1: d1?.bw1,
        ew1: d1?.ew1,
        bw2: d1?.bw2,
        ew2: d1?.ew2,
        bc1: d1?.b1,
        ec1: d1?.e1,
        bc2: d1?.b2,
        ec2: d1?.b2,
        beforeAlignment1: "",
        afterAlignment1: "",
        beforeAlignment2: "",
        afterAlignment2: "",
      }]);

    } else {
      setTextAvailable(true);
      setDataLoading({ ...dataLoading, books: true });
      let ms1Text = await getMilestoneText(
        releaseCode,
        versionCode1,
        d1.seq1,
        downloadedTextsRef.current,
        setDownloadedTexts
      );
      if (diffLoadGenRef.current !== myGen) { setDataLoading({ ...dataLoading, books: false }); return; }
      let ms2Text = await getMilestoneText(
        releaseCode,
        versionCode2,
        d1.seq2,
        downloadedTextsRef.current,
        setDownloadedTexts
      );
      if (diffLoadGenRef.current !== myGen) { setDataLoading({ ...dataLoading, books: false }); return; }
      //console.log(ms2Text)

      setDataLoading({ ...dataLoading, books: false });
      let b1Downloaded =
        downloadedTextsRef.current[releaseCode]?.[versionCode1]?.["downloadedMs"];
      let b2Downloaded =
        downloadedTextsRef.current[releaseCode]?.[versionCode2]?.["downloadedMs"];
      /*console.log("SETBOOKS");
      console.log(b1Downloaded);
      console.log(b2Downloaded);*/

      setBooks({
        book1: {
          versionCode: versionCode1,
          title: metaData?.book1?.bookTitle?.label,
          content: b1Downloaded?.msTexts,
          ms: d1?.seq1,
        },
        book2: {
          versionCode: versionCode2,
          title: metaData?.book2?.bookTitle?.label,
          content: b2Downloaded?.msTexts,
          ms: d1?.seq2,
        },
      });

      // reset the milestones to be displayed in the reader:
      setDisplayMs({ book1: {}, book2: {} });

      // extract the alignment text from the milestone
      // if it is not in the csv data:
      let [s1, startChar1, endChar1] = extractAlignment(
        ms1Text,
        d1?.bw1,
        d1?.ew1,
        "word",
        releaseCode
      );
      let [s2, startChar2, endChar2] = extractAlignment(
        ms2Text,
        d1?.bw2,
        d1?.ew2,
        "word",
        releaseCode
      );

      let beforeAlignment1 = ms1Text.slice(0, startChar1);
      let afterAlignment1 = ms1Text.slice(endChar1, ms1Text.length);
      let beforeAlignment2 = ms2Text.slice(0, startChar2);
      let afterAlignment2 = ms2Text.slice(endChar2, ms2Text.length);

      setBooksAlignment([{
        s1: s1,
        s2: s2,
        bw1: d1?.bw1,
        ew1: d1?.ew1,
        bw2: d1?.bw2,
        ew2: d1?.ew2,
        bc1: startChar1,
        ec1: endChar1,
        bc2: startChar2,
        ec2: endChar2,
        beforeAlignment1: beforeAlignment1,
        afterAlignment1: afterAlignment1,
        beforeAlignment2: beforeAlignment2,
        afterAlignment2: afterAlignment2,
      }]);
    }

    
    if (!diffShownRef.current) {
      document.getElementById("belowBooks").scrollIntoView({ behavior: "smooth", block: "end" });
      diffShownRef.current = true;
    }
    // Bail if the user navigated away while this load was in flight.
    if (diffLoadGenRef.current !== myGen) { return; }
    if (d1 === selectedLine) { return; }

    selectedLine && clearSelectedLine();
    selectedLine = d1;

    // make all non-selected yellow lines transparent:
    getConnections()
      .each(function hideOthers(d) {
        d.hidden = d !== d1;
      })
      .filter(filterHidden)
      .attr("opacity", 0.1);

    // make all non-selected red bars transparent:
    getBars().filter(filterHidden).attr("opacity", 0.1);
    // hide the dotted lines:
    drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);

    setTimeout(focusOnLine, 0, d1);

    function filterHidden(d) {
      return d.hidden;
    }
  }

  function clearSelectedLine() {
    if (!selectedLine) return;
    selectedLine = null;
    setSelectedD(null);
    selectedDRef.current = null;
    // Restore all connections and bars to full opacity (no transition — avoid
    // overriding the immediately following selection applied in clickToSelect):
    getConnections()
      .each(function(d) { d.hidden = false; })
      .attr("stroke", connColor)
      .attr("stroke-width", 1.5)
      .attr("opacity", null);
    getBars()
      .each(function(d) { d.hidden = false; })
      .attr("stroke-width", barWidth)
      .attr("opacity", null);
    drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);
    setToolTip({ isActive: false, layerX: 0, layerY: 0,
      data: { book1: { ms: "", pos1: "", pos2: "" }, book2: { ms: "", pos1: "", pos2: "" } } });
  }

  // Single-click: select the alignment and enable keyboard navigation (no text loading).
  // bookNum (1 or 2) indicates which book's bar is focused for tooltip placement.
  function clickToSelect(e, d1, bookNum = 1) {
    if (e && zoomModeRef.current) return; // mouse click disabled in zoom mode
    // Clicking the already-selected alignment deselects it:
    if (e && d1 === selectedLine) { clearSelectedLine(); return; }

    focusedBookRef.current = bookNum;

    // Apply visual selection only when changing to a different alignment:
    const isNewAlignment = d1 !== selectedLine;
    if (isNewAlignment) {
      const prev = selectedLine;
      selectedLine = d1;
      selectedDRef.current = d1;

      if (!e) {
        // Keyboard nav: defer React state updates so re-renders don't block every keypress.
        clearTimeout(navTimerRef.current);
        const _d1 = d1, _bookNum = bookNum;
        navTimerRef.current = setTimeout(() => {
          // Compute tooltip position from bar bounds after navigation settles.
          const selector = _bookNum === 1 ? "#firstchart .bar" : "#secondchart .bar";
          const barNode = drawingG?.selectAll(selector).filter(d => d === _d1).node();
          if (barNode) {
            const barRect = barNode.getBoundingClientRect();
            const boxRect = document.getElementById("chartBox")?.getBoundingClientRect();
            if (boxRect) tooltipPosRef.current = {
              layerX: barRect.left - boxRect.left + barRect.width / 2,
              layerY: barRect.top  - boxRect.top  + barRect.height / 2,
            };
          }
          setSelectedD(_d1);
          setToolTip({
            isActive: true,
            layerX: tooltipPosRef.current.layerX,
            layerY: tooltipPosRef.current.layerY,
            isSelected: true,
            data: { book1: { ms: _d1?.seq1, pos1: _d1?.bw1, pos2: _d1?.ew1 },
                    book2: { ms: _d1?.seq2, pos1: _d1?.bw2, pos2: _d1?.ew2 } },
          });
        }, 80);
      } else {
        // Mouse click: update React state immediately.
        setSelectedD(d1);
      }

      if (!prev) {
        // First selection: dim all elements except d1 (one O(n) pass each).
        getConnections()
          .each(function(d) { d.hidden = d !== d1; })
          .filter(d => d.hidden).attr("opacity", 0.1);
        getBars()
          .each(function(d) { d.hidden = d !== d1; })
          .filter(d => d.hidden).attr("opacity", 0.1);
      } else {
        // Already in selection mode: delta update — only touch the two changed elements.
        prev.hidden = true;
        d1.hidden = false;
        filterSelected(prev, getConnections())
          .attr("stroke", connColor).attr("stroke-width", null).attr("opacity", 0.1);
        filterSelected(prev, getBars())
          .attr("stroke-width", barWidth).attr("opacity", 0.1);
      }
      drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);
    }

    // Update tooltip position: immediately for mouse and up/down; deferred for left/right nav.
    if (e) {
      tooltipPosRef.current = { layerX: e.layerX, layerY: e.layerY };
    } else if (!isNewAlignment) {
      // Up/down: compute bar position for the newly focused book panel.
      const selector = bookNum === 1 ? "#firstchart .bar" : "#secondchart .bar";
      const barNode = drawingG?.selectAll(selector).filter(d => d === d1).node();
      if (barNode) {
        const barRect = barNode.getBoundingClientRect();
        const boxRect = document.getElementById("chartBox")?.getBoundingClientRect();
        if (boxRect) tooltipPosRef.current = {
          layerX: barRect.left - boxRect.left + barRect.width / 2,
          layerY: barRect.top  - boxRect.top  + barRect.height / 2,
        };
      }
    }

    // Interrupt any lingering transition on the newly selected elements:
    filterSelected(d1, getBars()).interrupt();
    filterSelected(d1, getConnections()).interrupt();
    // Skip tooltip during rapid left/right nav (timer handles it); always show for up/down.
    mouseOver(e, d1, !e && isNewAlignment);
  }

  /////////////////// CHART MAIN FUNCTIONS ///////////////////

  // t2
  const normalChart = () => {
    // Rebuild navData from filtered datasets:
    const _ds = filteredDataSetsRef.current;
    const _sorted = [..._ds].sort((a, b) => Number(a.seq1) - Number(b.seq1) || Number(a.seq2) - Number(b.seq2));
    const _sortedBySeq2 = [..._ds].sort((a, b) => Number(a.seq2) - Number(b.seq2) || Number(a.seq1) - Number(b.seq1));
    const _bySeq1 = {}, _bySeq2 = {};
    for (const d of _sorted)     { const k = String(d.seq1); if (!_bySeq1[k]) _bySeq1[k] = []; _bySeq1[k].push(d); }
    for (const d of _sortedBySeq2) { const k = String(d.seq2); if (!_bySeq2[k]) _bySeq2[k] = []; _bySeq2[k].push(d); }
    navDataRef.current = { sorted: _sorted, sortedBySeq2: _sortedBySeq2, bySeq1: _bySeq1, bySeq2: _bySeq2 };

    createChart();
    // Clicking empty SVG space clears the current selection:
    svgD3.on("click", () => clearSelectedLineRef.current?.());
    // Ctrl+scroll zooms the panel under the cursor.
    svgD3.on("wheel.ctrl-zoom", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const [mouseX, mouseY] = d3.pointer(e, drawingG.node());
      const factor = e.deltaY > 0 ? 1.5 : 1 / 1.5;  // scroll down = zoom out
      const zoomPanel = (scale, bookMax, getCurrent, setCurrent) => {
        const midMs = scale.invert(mouseX);
        const curDomain = scale.domain();
        const curSpan = curDomain[1] - curDomain[0];
        const fullSpan = xIdentityDomain[1] - xIdentityDomain[0];
        const newSpan = Math.min(curSpan * factor, fullSpan);
        if (newSpan >= fullSpan) { setCurrent(null); scale.domain(xIdentityDomain); return; }
        const rawMin = midMs - newSpan / 2;
        const newMin = Math.max(0, rawMin);
        const newMax = Math.min(bookMax, newMin + newSpan);
        const adjustedMin = newMax === bookMax ? Math.max(0, bookMax - newSpan) : newMin;
        const d = [adjustedMin, newMax];
        setCurrent(d); scale.domain(d);
      };
      if (mouseY >= 0 && mouseY <= barMaxHeight) {
        zoomPanel(xScale1, max.book1, () => currentXDomain1, d => { currentXDomain1 = d; });
        zoom();
      } else if (mouseY >= barMaxHeight * 2 && mouseY <= barMaxHeight * 3) {
        zoomPanel(xScale2, max.book2, () => currentXDomain2, d => { currentXDomain2 = d; });
        zoom();
      }
    });
    setLayout();
    drawChart();
    getConnections();
    getBars();
    isFlipped ? flipChart(0) : updateChart(0);
    // Keep function refs current for the keyboard handler:
    clickToSelectRef.current = clickToSelect;
    selectLineOnClickedRef.current = selectLineOnClicked;
    clearSelectedLineRef.current = clearSelectedLine;
    panToAlignmentRef.current = panToAlignment;
    drawTocMarkersRef.current = drawTocMarkers;
    panToTocMarkerRef.current = panToTocMarker;
    zoomToTocSectionRef.current = zoomToTocSection;
    // Re-apply zoom mode z-order and pointer-events after SVG rebuild
    // (createChart always places brushes at the bottom):
    if (zoomModeRef.current) {
      brushG.style("display", null);
      brushG2.style("display", null);
      brushG.raise();
      brushG2.raise();
      brushG.style("pointer-events", null);
      brushG2.style("pointer-events", null);
      brushG.select(".overlay").style("cursor", "zoom-in");
      brushG2.select(".overlay").style("cursor", "zoom-in");
    } else {
      brushG.style("display", null);
      brushG2.style("display", null);
      brushG.style("pointer-events", null);
      brushG2.style("pointer-events", null);
      brushG.select(".overlay").style("cursor", null);
      brushG2.select(".overlay").style("cursor", null);
    }
    // Crop unused TOC rows by adjusting viewBox to match the currently visible rows.
    applySvgCrop();
  };

  // In zoom mode: raise brush groups above drawingG/marksG so the overlay intercepts all events.
  // In normal mode: lower them back to the bottom so bars receive events naturally.
  useEffect(() => {
    if (zoomMode) {
      brushGRef.current?.style("display", null);
      brushG2Ref.current?.style("display", null);
      brushGRef.current?.raise();
      brushG2Ref.current?.raise();
      brushGRef.current?.style("pointer-events", null);
      brushG2Ref.current?.style("pointer-events", null);
      brushGRef.current?.select(".overlay").style("cursor", "zoom-in");
      brushG2Ref.current?.select(".overlay").style("cursor", "zoom-in");

      const onKeyDown = (e) => {
        if (e.key === "Shift" && !shiftPressedRef.current) {
          shiftPressedRef.current = true;
          brushGRef.current?.select(".overlay").style("cursor", "zoom-out");
          brushG2Ref.current?.select(".overlay").style("cursor", "zoom-out");
        }
      };
      const onKeyUp = (e) => {
        if (e.key === "Shift") {
          shiftPressedRef.current = false;
          brushGRef.current?.select(".overlay").style("cursor", "zoom-in");
          brushG2Ref.current?.select(".overlay").style("cursor", "zoom-in");
        }
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup",   onKeyUp);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup",   onKeyUp);
        shiftPressedRef.current = false;
      };
    } else {
      // Restore original order: brushG first, brushG2 second (lowest z-order).
      brushG2Ref.current?.lower();
      brushGRef.current?.lower();
      brushGRef.current?.style("pointer-events", null);
      brushG2Ref.current?.style("pointer-events", null);
      brushGRef.current?.select(".overlay").style("cursor", null);
      brushG2Ref.current?.select(".overlay").style("cursor", null);
    }
  }, [zoomMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Crop the SVG height/viewBox to hide unused TOC rows without touching the coordinate system.
  const applySvgCrop = () => {
    const fullH = svgFullHeightRef.current;
    const fullW = svgFullWidthRef.current;
    if (!fullH || !fullW) return;
    const topToc = isFlipped ? toc2 : toc1;
    const botToc = isFlipped ? toc1 : toc2;
    const topExp = isFlipped ? expandedTocMarkers2 : expandedTocMarkers1;
    const botExp = isFlipped ? expandedTocMarkers1 : expandedTocMarkers2;
    const visRows1 = includeTocMarkers ? getRows(topToc, topExp).length : 0;
    const visRows2 = includeTocMarkers ? getRows(botToc, botExp).length : 0;
    const maxD1    = includeTocMarkers ? getMaxDepth(topToc) : 0;
    const maxD2    = includeTocMarkers ? getMaxDepth(botToc) : 0;
    const offsetTop = (maxD1 - visRows1) * TOC_ROW_HEIGHT;
    const offsetBot = (maxD2 - visRows2) * TOC_ROW_HEIGHT;
    const croppedH  = fullH - offsetTop - offsetBot;
    const svgEl = document.getElementById("svgChart");
    if (svgEl) {
      svgEl.setAttribute("height", croppedH);
      svgEl.setAttribute("viewBox", `0 ${offsetTop} ${fullW} ${croppedH}`);
    }
  };

  // When TOC data arrives or marker visibility changes, rebuild so pvmTop/pvmBottom take effect.
  useEffect(() => {
    normalChart(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [toc1, toc2, includeTocMarkers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expand/collapse: only update viewBox crop + redraw markers — no full chart rebuild.
  useEffect(() => {
    applySvgCrop(); // eslint-disable-line react-hooks/exhaustive-deps
    drawTocMarkersRef.current?.();
  }, [expandedTocMarkers1, expandedTocMarkers2]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selection changes only affect marker styling, not layout.
  useEffect(() => {
    drawTocMarkersRef.current?.();
  }, [selectedTocMarker1, selectedTocMarker2]); // eslint-disable-line react-hooks/exhaustive-deps

  /////////////////////////////////////////////////////////////////////

  useEffect(() => {
    // Swap domains before redraw: each panel now shows the other book's content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentXDomain1, currentXDomain2] = [currentXDomain2, currentXDomain1]; // eslint-disable-line react-hooks/exhaustive-deps
    normalChart();
    // Restore visual selection after flip — deferred so the 0-duration transition
    // has committed its final bar positions before we read getBoundingClientRect():
    const sel = selectedDRef.current;
    const book = focusedBookRef.current;
    if (sel) {
      setTimeout(() => {
        clickToSelectRef.current?.(null, sel, book);
        panToAlignmentRef.current?.(sel);
      }, 0);
    } else if (focusedDataIndex) {
      mouseOver(null, chartData?.dataSets[focusedDataIndex]);
      selectLineOnClicked(null, chartData?.dataSets[focusedDataIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped]);

  // Reset diff-shown flag when a new book pair is loaded.
  useEffect(() => {
    diffShownRef.current = false;
  }, [chartData]); // eslint-disable-line react-hooks/exhaustive-deps

  // redraw the chart when the margins change
  useEffect(() => {
    normalChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visMargins, axisLabelFontSize, tickFontSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render download annotations (URL, metadata labels) separately so toggling the
  // download panel doesn't re-run the expensive normalChart effect.
  useEffect(() => {
    const svg = d3.select("#svgChart");
    svg.selectAll(".download-annotation").remove();
    if (!showDownloadOptions) return;
    const charHeight = axisLabelFontSize;
    const lineHeight = charHeight * 1.3;
    if (includeMetaInDownload !== "no") {
      const b1 = isFlipped ? metaData?.book2 : metaData?.book1;
      const b2 = isFlipped ? metaData?.book1 : metaData?.book2;
      const textContentb1 = getMetaLabel(b1, includeMetaInDownload);
      const textContentb2 = getMetaLabel(b2, includeMetaInDownload);
      if (metaPositionInDownload === "left") {
        const labelLinesb1 = wrapTextToSvgWidth(textContentb1, 200, axisLabelFontSize);
        const labelLinesb2 = wrapTextToSvgWidth(textContentb2, 200, axisLabelFontSize);
        let space = visMargins.left - yTickWidth - lineHeight;
        labelLinesb1.reverse().forEach((line) => {
          const x = space, y = pvmTop;
          svg.append("text").attr("class", "download-annotation yLabel")
            .attr("text-anchor", "end").attr("x", x).attr("y", y)
            .attr("transform", `rotate(-90, ${x}, ${y})`)
            .style("font-size", `${axisLabelFontSize}px`).text(line);
          space -= lineHeight;
        });
        space = visMargins.left - yTickWidth - lineHeight;
        labelLinesb2.reverse().forEach((line) => {
          const x = space, y = pvmTop + 450;
          svg.append("text").attr("class", "download-annotation yLabel")
            .attr("text-anchor", "start").attr("x", x).attr("y", y)
            .attr("transform", `rotate(-90, ${x}, ${y})`)
            .style("font-size", `${axisLabelFontSize}px`).text(line);
          space -= lineHeight;
        });
      } else {
        svg.append("text").attr("class", "download-annotation")
          .attr("x", visMargins.left)
          .attr("y", includeURL ? 3 * axisLabelFontSize : axisLabelFontSize)
          .attr("text-anchor", "left").style("font-size", `${axisLabelFontSize}px`)
          .text(textContentb1);
        svg.append("text").attr("class", "download-annotation")
          .attr("x", visMargins.left)
          .attr("y", outerHeight - 0.9 * pvmBottom)
          .attr("text-anchor", "left").style("font-size", `${axisLabelFontSize}px`)
          .text(textContentb2);
      }
    }
  }, [showDownloadOptions, includeURL, includeMetaInDownload, metaPositionInDownload, // eslint-disable-line react-hooks/exhaustive-deps
      isFlipped, axisLabelFontSize, visMargins, url, yTickWidth, metaData]);

  // Keyboard navigation for selected alignment.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

      // Z toggles zoom mode regardless of current state.
      if (e.key === 'z' || e.key === 'Z') {
        setZoomMode(v => !v);
        return;
      }

      if (zoomModeRef.current) return;

      // TOC triangle navigation (takes priority over bar navigation when a triangle is selected).
      const { m1, m2 } = selectedTocMarkerRef.current;
      const activePanel = activeTocPanelRef.current;
      if (activePanel !== null && (m1 !== null || m2 !== null)) {
        const { toc1: ct1, toc2: ct2, isFlipped: fl } = tocHighlightRef.current;
        const toc       = activePanel === 'top' ? (fl ? ct2 : ct1) : (fl ? ct1 : ct2);
        const currentId = activePanel === 'top' ? (fl ? m2  : m1)  : (fl ? m1  : m2);
        const setSel    = activePanel === 'top'
          ? (fl ? setSelectedTocMarker2 : setSelectedTocMarker1)
          : (fl ? setSelectedTocMarker1 : setSelectedTocMarker2);
        const setExp    = activePanel === 'top'
          ? (fl ? setExpandedTocMarkers2 : setExpandedTocMarkers1)
          : (fl ? setExpandedTocMarkers1 : setExpandedTocMarkers2);

        if (toc && currentId !== null) {
          const useTop = activePanel === 'top';
          const panAfter = (id) => panToTocMarkerRef.current?.(toc, id, useTop);
          // Show tooltip for the newly selected triangle.
          const showTocTooltip = (id) => {
            const el = document.querySelector(`#svgChart .toc-markers [data-toc-id="${id}"]`);
            const boxRect = document.getElementById("chartBox")?.getBoundingClientRect();
            if (!el || !boxRect) return;
            const r = el.getBoundingClientRect();
            setToolTip(p => ({
              ...p, isActive: true,
              layerX: r.left - boxRect.left + r.width / 2,
              layerY: r.top  - boxRect.top  + r.height / 2,
              sectionTitle: getSectionHierarchy(toc, id),
            }));
          };
          // Auto-expand the newly selected section so its children become visible.
          const autoExpand = (id) => {
            if (getTocChildren(toc, id).length) {
              setExp(prev => {
                if (prev.has(id)) return prev;
                const n = new Set(prev); n.add(id); return n;
              });
            }
          };
          const navigate = (id) => { setSel(id); autoExpand(id); panAfter(id); showTocTooltip(id); };
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            const next = getTocNext(toc, currentId);
            if (next !== null) navigate(next);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = getTocPrev(toc, currentId);
            if (prev !== null) navigate(prev);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const parent = toc.sections[currentId]?.parent;
            if (parent != null) navigate(typeof parent === 'number' ? parent : parseInt(parent));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const children = getTocChildren(toc, currentId);
            if (children.length) {
              setExp(prev => { const n = new Set(prev); n.add(currentId); return n; });
              navigate(children[0]);
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            zoomToTocSectionRef.current?.(toc, currentId, useTop);
          } else if (e.key === 'Escape') {
            setSel(null);
            activeTocPanelRef.current = null;
            setToolTip(p => ({ ...p, isActive: false, sectionTitle: null }));
          }
          return; // consumed by TOC navigation
        }
      }

      const cur = selectedDRef.current;
      if (!cur) return;

      const { sorted, sortedBySeq2 } = navDataRef.current ?? {};
      if (!sorted) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const book = focusedBookRef.current;
        const list = book === 2 ? sortedBySeq2 : sorted;
        const idx = list.indexOf(cur);
        const next = e.key === 'ArrowRight'
          ? list[(idx + 1) % list.length]
          : list[(idx - 1 + list.length) % list.length];
        if (next) {
          diffLoadGenRef.current++;   // invalidate any in-flight selectLineOnClicked
          clickToSelectRef.current?.(null, next, book);
          panToAlignmentRef.current?.(next);
          clearTimeout(diffLoadTimerRef.current);
          diffLoadTimerRef.current = setTimeout(() => {
            selectLineOnClickedRef.current?.(null, next);
          }, 300);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Switch focused book: Down → book2, Up → book1
        const newBook = e.key === 'ArrowDown' ? 2 : 1;
        if (newBook !== focusedBookRef.current) {
          clickToSelectRef.current?.(null, cur, newBook);
          panToAlignmentRef.current?.(cur);
        }
      } else if (e.key === 'Enter') {
        selectLineOnClickedRef.current?.(null, cur);
      } else if (e.key === 'Escape') {
        clearSelectedLineRef.current?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SectionHeaderLayout
        item={{
          title: "Pairwise Visualization",
          icon: "fa-solid fa-chart-column",
        }}
        toggle={toggle}
        setToggle={setToggle}
        showDownloadOptions={showDownloadOptions}
        includeURL={includeURL}
        setIncludeURL={setIncludeURL}
        includeMetadata={includeMetadata}
        setIncludeMetadata={setIncludeMetadata}
        includeTocMarkers={includeTocMarkers}
        setIncludeTocMarkers={setIncludeTocMarkers}
        mb={showTocPanel ? 0 : "20px"}
      >
        <VisualizationHeader
          restoreCanvas={restoreCanvas}
          isPairwiseViz={props.isPairwiseViz}
          showDownloadOptions={showDownloadOptions}
          setShowDownloadOptions={setShowDownloadOptions}
          showFilterPanel={showTocPanel}
          setShowFilterPanel={setShowTocPanel}
          zoomMode={zoomMode}
          setZoomMode={setZoomMode}
        />
      </SectionHeaderLayout>
      <Box
        id="pairwise-chart"
        ref={pairwiseChartRef}
        sx={{ px: { xs: "0px", sm: "30px" } }}
      >
        {/* 1. Top Section (book1 metadata panel) — hidden when metadata SVG replaces it */}
        <Box sx={{
          display: (showDownloadOptions && includeMetadata) ? "none" : "flex",
          alignItems: "center", justifyContent: "space-between", mt: "20px",
        }}>
          <Section isVertical data={isFlipped ? metaData?.book2 : metaData?.book1} />
          <MSToggler
            isTop={isFlipped ? false : true}
            isBook1={isFlipped ? false : true}
            navDataRef={navDataRef}
            clickToSelectRef={clickToSelectRef}
            selectLineOnClickedRef={selectLineOnClickedRef}
            clearSelectedLineRef={clearSelectedLineRef}
            selectedDRef={selectedDRef}
            panToAlignmentRef={panToAlignmentRef}
            diffLoadGenRef={diffLoadGenRef}
            diffLoadTimerRef={diffLoadTimerRef}
          />
        </Box>

        {/* 2. URL SVG — between top Section and metadata SVG */}
        {showDownloadOptions && includeURL && (() => {
          const urlFontSize = Math.min(axisLabelFontSize, 12);
          const chartSvg = document.getElementById('svgChart');
          const svgWidth = chartSvg
            ? (chartSvg.clientWidth || parseFloat(chartSvg.getAttribute('width')) || 600)
            : 600;
          const urlLines = wrapTextToSvgWidth(
            window.location.href, svgWidth - (visMargins.left || 0) - 10, urlFontSize
          );
          const urlSvgHeight = urlFontSize * 1.3 * urlLines.length + 4;
          return (
            <svg id="url-label-svg" width={svgWidth} height={urlSvgHeight}
              style={{ display: "block", fontFamily: "Arial" }}>
              {urlLines.map((line, i) => (
                <text key={i} x={svgWidth / 2} y={urlFontSize * 1.3 * (i + 1)}
                  textAnchor="middle"
                  style={{ fontSize: `${urlFontSize}px`, textDecoration: "underline" }}>
                  {line}
                </text>
              ))}
            </svg>
          );
        })()}

        {/* 3. Metadata SVG (top) — between URL and chart */}
        {showDownloadOptions && includeMetadata && (() => {
          const chartSvg = document.getElementById('svgChart');
          const svgWidth = chartSvg
            ? (chartSvg.clientWidth || parseFloat(chartSvg.getAttribute('width')) || 600)
            : 600;
          return (
            <MetadataSvg id="metadata-top-svg"
              data={isFlipped ? metaData?.book2 : metaData?.book1}
              svgWidth={svgWidth} marginLeft={visMargins.left || 0} />
          );
        })()}

        <Box id={"chartBox"} sx={{ width: "100%", position: "relative" }}>
          <svg
            id={"svgChart"}
            style={{ position: "relative", background: "white", fontFamily: "Arial" }}
          ></svg>
          {toolTip.isActive && (
            <Box
              id="pairwise-tooltip"
              sx={{
                minWidth: "180px",
                maxWidth: "300px",
                background: "rgba(255, 255, 255, 0.9)",
                color: "black",
                border: "1px solid rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
                position: "absolute",
                top: `${toolTip.layerY - 20}px`,
                left: `${toolTip?.layerX + 15}px`,
                padding: "10px",
                boxSizing: "border-box",
                opacity: 0.8,
                zIndex: 100,
              }}
            >
              {toolTip.sectionTitle ? (
                <>
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>Section(s):</Typography>
                  <div style={{ fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: toolTip.sectionTitle }} />
                </>
              ) : (<>
              <Typography sx={{ fontSize: "12px" }} fontWeight={"bold"}>
                Book 1{" "}
                {isFlipped
                  ? metaData?.book2?.bookTitle?.label
                  : metaData?.book1?.bookTitle?.label}
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                MS#{" "}
                {isFlipped
                  ? toolTip?.data?.book2?.ms
                  : toolTip?.data?.book1?.ms
                }
                ,{" "}token positions{" "}
                {`${
                  isFlipped
                    ? toolTip?.data?.book2?.pos1
                    : toolTip?.data?.book1?.pos1
                }-${
                  isFlipped
                    ? toolTip?.data?.book2?.pos2
                    : toolTip?.data?.book1?.pos2
                }`}
              </Typography>
              {(() => {
                const toc = isFlipped ? toc2 : toc1;
                const ms = isFlipped ? toolTip?.data?.book2?.ms : toolTip?.data?.book1?.ms;
                const headings = getMilestoneHeadings(toc, ms);
                if (!headings){
                  return <Typography 
                            sx={{ fontSize: "12px", fontStyle: "italic", opacity: 0.7 }}
                          >
                            (no table of contents available)
                          </Typography>;
                }
                return headings ? (
                  <>
                    <Typography sx={{ fontSize: "12px", fontWeight: "bold", cursor: "pointer", userSelect: "none", color: "#2862a5" }}
                                onClick={() => setSecs1Open(v => !v)}>
                      {secs1Open ? "Hide section headers" : "Show section header(s)"}
                    </Typography>
                    {secs1Open && <div style={{ fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: headings }} />}
                  </>
                ) : null;
              })()}
              <Typography sx={{ fontSize: "12px" }} fontWeight={"bold"}>
                Book 2{" "}
                {isFlipped
                  ? metaData?.book1?.bookTitle?.label
                  : metaData?.book2?.bookTitle?.label}
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                MS#{" "}
                {isFlipped
                  ? toolTip?.data?.book1?.ms
                  : toolTip?.data?.book2?.ms}
                , token positions{" "}
                {`${
                  isFlipped
                    ? toolTip?.data?.book1?.pos1
                    : toolTip?.data?.book2?.pos1
                }-${
                  isFlipped
                    ? toolTip?.data?.book1?.pos2
                    : toolTip?.data?.book2?.pos2
                }`}
              </Typography>
              {(() => {
                const toc = isFlipped ? toc1 : toc2;
                const ms = isFlipped ? toolTip?.data?.book1?.ms : toolTip?.data?.book2?.ms;
                const headings = getMilestoneHeadings(toc, ms);
                if (!headings){
                  return <Typography 
                            sx={{ fontSize: "12px", fontStyle: "italic", opacity: 0.7 }}
                          >
                            (no table of contents available)
                          </Typography>;
                }
                return headings ? (
                  <>
                    <Typography sx={{ fontSize: "12px", fontWeight: "bold", cursor: "pointer", userSelect: "none", color: "#2862a5" }}
                                onClick={() => setSecs2Open(v => !v)}>
                      {secs2Open ? "Hide section headers" : "Show section header(s)"}
                    </Typography>
                    {secs2Open && <div style={{ fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: headings }} />}
                  </>
                ) : null;
              })()}
              {toolTip.isSelected ? (
                <Typography sx={{ fontSize: "11px", mt: "6px", fontStyle: "italic", opacity: 0.85 }}>
                  Press Enter to view aligned text - Right/Left arrow to navigate · Up/Down arrow to switch book · Escape to deselect
                </Typography>
              ) : (
                <Typography sx={{ fontSize: "11px", mt: "6px", fontStyle: "italic", opacity: 0.85 }}>
                  Click to activate arrow key navigation · Double-click to view aligned text
                </Typography>
              )}
              </>)}
            </Box>
          )}
        </Box>
        {/* 4. Metadata SVG (bottom) — pull up by the extra bottom padding of the chart SVG */}
        {showDownloadOptions && includeMetadata && (() => {
          const chartSvg = document.getElementById('svgChart');
          const svgWidth = chartSvg
            ? (chartSvg.clientWidth || parseFloat(chartSvg.getAttribute('width')) || 600)
            : 600;
          const correction = 20 + (visMargins.bottom || 0) - (visMargins.top || 0);
          return (
            <Box sx={{ mt: `${-correction}px`, position: "relative", zIndex: 1 }}>
              <MetadataSvg id="metadata-bottom-svg"
                data={isFlipped ? metaData?.book1 : metaData?.book2}
                svgWidth={svgWidth} marginLeft={visMargins.left || 0} />
            </Box>
          );
        })()}

        {/* 5. Bottom Section (book2 metadata panel) — hidden when metadata SVG replaces it */}
        <Box sx={{
          display: (showDownloadOptions && includeMetadata) ? "none" : "flex",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <Section isVertical data={isFlipped ? metaData?.book1 : metaData?.book2} />
          <MSToggler
            isTop={isFlipped ? true : false}
            isBook1={isFlipped ? true : false}
            navDataRef={navDataRef}
            clickToSelectRef={clickToSelectRef}
            selectLineOnClickedRef={selectLineOnClickedRef}
            clearSelectedLineRef={clearSelectedLineRef}
            selectedDRef={selectedDRef}
            panToAlignmentRef={panToAlignmentRef}
            diffLoadGenRef={diffLoadGenRef}
            diffLoadTimerRef={diffLoadTimerRef}
          />
        </Box>
        {/* TOC filter slide-out panel — fixed to viewport right, height matches chart div */}
        <Box sx={{
          position: "fixed",
          top: tocPanelBounds.top,
          height: tocPanelBounds.height,
          right: 0, width: "300px",
          bgcolor: "background.paper",
          boxShadow: "-3px 0 12px rgba(0,0,0,0.18)",
          zIndex: 1200,
          display: "flex", flexDirection: "column", overflow: "hidden",
          transform: (showTocPanel && (toc1 || toc2)) ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
        }}>
          <Box sx={{ flex: 1, borderBottom: "2px solid #ccc", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <TocFilter
              toc={isFlipped ? toc2 : toc1}
              selectedSectionIds={isFlipped ? selectedSections2 : selectedSections1}
              setSelectedSectionIds={isFlipped ? setSelectedSections2 : setSelectedSections1}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <TocFilter
              toc={isFlipped ? toc1 : toc2}
              selectedSectionIds={isFlipped ? selectedSections1 : selectedSections2}
              setSelectedSectionIds={isFlipped ? setSelectedSections1 : setSelectedSections2}
            />
          </Box>
        </Box>
      </Box>
    </>
  );

};

export default Visual;
