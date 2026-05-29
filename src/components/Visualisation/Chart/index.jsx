import { Box, Typography } from "@mui/material";
import { useContext, useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Section, { MetadataSvg } from "../Metadata/Section";
import MSToggler from "../SectionHeader/MSToggler";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import VisualizationHeader from "../SectionHeader/VisualizationHeader";
import { Context } from "../../../App";
import { extractAlignment } from "../../../functions/alignmentFunctions";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import { getHighestValueInArrayOfObjects, wrapTextToSvgWidth, getMetaLabel } from "../../../utility/Helper";
import * as d3 from "d3";


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
    setFlipTimeLoading,
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
  const [toggle, setToggle] = useState(false);
  const [searchParams] = useSearchParams();

  // Selected alignment for keyboard navigation (separate from focusedDataIndex which triggers text loading):
  const [selectedD, setSelectedD] = useState(null);
  const selectedDRef = useRef(null);
  useEffect(() => { selectedDRef.current = selectedD; }, [selectedD]);
  // Which book (1 or 2) is currently focused for left/right navigation:
  const focusedBookRef = useRef(1);
  // Last tooltip mouse position — reused when navigating with arrow keys:
  const tooltipPosRef = useRef({ layerX: 200, layerY: 50 });
  // Pre-computed sorted datasets for O(1) navigation:
  const navDataRef = useRef(null);
  useEffect(() => {
    const datasets = chartData?.dataSets ?? [];
    const sorted = [...datasets].sort((a, b) =>
      Number(a.seq1) - Number(b.seq1) || Number(a.seq2) - Number(b.seq2)
    );
    const sortedBySeq2 = [...datasets].sort((a, b) =>
      Number(a.seq2) - Number(b.seq2) || Number(a.seq1) - Number(b.seq1)
    );
    navDataRef.current = { sorted, sortedBySeq2 };
  }, [chartData?.dataSets]);
  // Stable refs to functions that must be called from the keyboard handler:
  const clickToSelectRef = useRef(null);
  const selectLineOnClickedRef = useRef(null);
  const clearSelectedLineRef = useRef(null);
  const panToAlignmentRef = useRef(null);

  const [toolTip, setToolTip] = useState({
    isActive: false,
    layerX: 0,
    layerY: 0,
    data: {
      book1: {
        ms: "",
        pos1: "",
        pos2: "",
      },
      book2: {
        ms: "",
        pos1: "",
        pos2: "",
      },
    },
  });

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
    barWidth = 0.5,
    barMaxHeight = 150,
    chunkSize = 300,
    connColor = "#FFCC66",
    connHColor = "#ff9600",
    hoverStrokeWidth = 3,
    selectedLine = null;

  // set the dimensions and margins of the graph
  //var margin =  { top: 40, right: 20, bottom: 20, left: 60 };
  var padding = { top: 40, right: 0,  bottom: 40, left: 40 };

  var book1Bars, connections, book2Bars, brushG, brushG2;
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
    outerHeight = startOuterHeight + visMargins.top + visMargins.bottom - defaultMargins.top - defaultMargins.bottom;
    //outerHeight = startOuterHeight
    innerHeight = outerHeight - visMargins.top - visMargins.bottom;
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

    drawingG.attr(
      "transform",
      "translate(" + visMargins.left + "," + visMargins.top + ")"
    );
    brushG.attr(
      "transform",
      "translate(" + visMargins.left + "," + visMargins.top + ")"
    );
    brushG2.attr(
      "transform",
      "translate(" + visMargins.left + "," + visMargins.top + ")"
    );
    marksG.attr(
      "transform",
      "translate(" + visMargins.left + "," + visMargins.top + ")"
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
    // Brush 1 covers the top bar panel; brush 2 covers the bottom bar panel:
    brushHandle1.extent([[0, 0],              [width, barMaxHeight]]);
    brushHandle2.extent([[0, barMaxHeight * 2],[width, barMaxHeight * 3]]);
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
    var book1BarNodes = book1Bars.selectAll(".bar").data(chartData?.dataSets);

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
      .data(chartData?.dataSets);

    connectionNodes
      .enter()
      .append("path")
      .attr("class", "connection")
      .attr("stroke", connColor);

    connectionNodes.exit().remove();
    // --- Draw Connections Curves [END] :::

    // --- Draw Book2 Bar Chart [START] :::
    var book2BarNodes = book2Bars
      .selectAll(".bar")
      .data(chartData?.dataSets)
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
    brushG.call(brushHandle1).select(".overlay");
    brushG2.call(brushHandle2).select(".overlay");

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
    var t = svgD3.transition().duration(duration || 0);

    // - render Bars of Book1 and Book2 ::
    book1Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => clickToSelect(e, d, 1))
      .on("dblclick", selectLineOnClicked)
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
      .on("click", (e, d) => clickToSelect(e, d, 1))
      .on("dblclick", selectLineOnClicked)
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
      .on("click", (e, d) => clickToSelect(e, d, 2))
      .on("dblclick", selectLineOnClicked)
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

    // Re-assert selection dimming in case zoom was called while a line is selected:
    if (selectedLine) {
      getConnections().filter(d => d !== selectedLine).attr("opacity", 0.1);
      getBars().filter(d => d !== selectedLine).attr("opacity", 0.1);
    }

    return t;
  }

  function flipChart(duration) {
    var t = svgD3.transition().duration(duration || 0);

    // - render Bars of Book1 and Book2 ::
    book1Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", (e, d) => clickToSelect(e, d, 2))
      .on("dblclick", selectLineOnClicked)
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
      .on("click", (e, d) => clickToSelect(e, d, 1))
      .on("dblclick", selectLineOnClicked)
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
      .on("click", (e, d) => clickToSelect(e, d, 1))
      .on("dblclick", selectLineOnClicked)
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

    return t;
  }

  /////////////// CHART HELPER FUNCTIONS: INTERACTIONS ////////////////////

  function brushEnded1(e) {
    if (!e.sourceEvent) return;
    var sel = e.selection;
    if (!sel) return;
    currentXDomain1 = sel.map(d => Math.round(xScale1.invert(d)));
    xScale1.domain(currentXDomain1);
    zoom();
  }

  function brushEnded2(e) {
    if (!e.sourceEvent) return;
    var sel = e.selection;
    if (!sel) return;
    currentXDomain2 = sel.map(d => Math.round(xScale2.invert(d)));
    xScale2.domain(currentXDomain2);
    zoom();
  }

  function restoreCanvas() {
    if (selectedLine) selectedLine = null;
    setFocusedDataIndex(null);
    currentXDomain1 = null;
    currentXDomain2 = null;
    normalChart();
    setTimeout(zoom, 0);
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
    const last  = domain ? Math.floor(domain[1]) : fullMax;
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
    const newDomain = [val - span / 2, val + span / 2];
    if (panBook === 1) { currentXDomain1 = newDomain; xScale1.domain(newDomain); }
    else               { currentXDomain2 = newDomain; xScale2.domain(newDomain); }
    return true;
  }

  // Pan both panels as needed and redraw once if anything changed.
  function panToAlignment(d1) {
    const moved1 = _panPanel(d1, 1);
    const moved2 = _panPanel(d1, 2);
    if (moved1 || moved2) zoom();
  }

  function focusOnLine(d1) {
    var pad = xScaleIdentity.invert(5);
    var s1 = Number(isFlipped ? d1.seq2 : d1.seq1);
    var s2 = Number(isFlipped ? d1.seq1 : d1.seq2);
    currentXDomain1 = [s1 - pad, s1 + pad];
    currentXDomain2 = [s2 - pad, s2 + pad];
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

  async function mouseOver(e, d1) {
    // Suppress hover tooltip for non-selected bars when a selection is active:
    if (e && selectedDRef.current && d1 !== selectedDRef.current) return;
    // set data to tooltip
    const pos = e ? { layerX: e.layerX, layerY: e.layerY } : tooltipPosRef.current;
    if (e) tooltipPosRef.current = pos;
    setToolTip({
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
    // If a different alignment is selected, restore its tooltip instead of clearing:
    if (selectedDRef.current && d1 !== selectedDRef.current) {
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
      .attr("stroke-width", null)
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
    // Ensure the selection state is consistent when called via double-click or keyboard Enter:
    if (d1 !== selectedLine) clickToSelect(e, d1);
    setFlipTimeLoading(true);
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
        downloadedTexts,
        setDownloadedTexts
      );
      //console.log(ms1Text)
      //console.log(`getMilestoneText(${releaseCode}, ${versionCode2}, ${d1.ms2})`);
      let ms2Text = await getMilestoneText(
        releaseCode,
        versionCode2,
        d1.seq2,
        downloadedTexts,
        setDownloadedTexts
      );
      //console.log(ms2Text)

      setDataLoading({ ...dataLoading, books: false });
      let b1Downloaded =
        downloadedTexts[releaseCode][versionCode1]["downloadedMs"];
      let b2Downloaded =
        downloadedTexts[releaseCode][versionCode2]["downloadedMs"];
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
          content: b2Downloaded,
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
        "word"
      );
      let [s2, startChar2, endChar2] = extractAlignment(
        ms2Text,
        d1?.bw2,
        d1?.ew2,
        "word"
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

    
    document.getElementById("belowBooks").scrollIntoView({ behavior: "smooth", block: "end" });
    if (d1 === selectedLine) { setFlipTimeLoading(false); return; }

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

    setFlipTimeLoading(false);
  }

  function clearSelectedLine() {
    if (!selectedLine) return;
    selectedLine = null;
    setSelectedD(null);
    selectedDRef.current = null;
    // Restore all connections and bars to full opacity:
    getConnections()
      .each(function(d) { d.hidden = false; })
      .transition()
      .attr("stroke", connColor)
      .attr("stroke-width", null)
      .attr("opacity", null);
    getBars()
      .each(function(d) { d.hidden = false; })
      .transition()
      .attr("stroke-width", barWidth)
      .attr("opacity", null);
    drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);
    setToolTip({ isActive: false, layerX: 0, layerY: 0,
      data: { book1: { ms: "", pos1: "", pos2: "" }, book2: { ms: "", pos1: "", pos2: "" } } });
  }

  // Single-click: select the alignment and enable keyboard navigation (no text loading).
  // bookNum (1 or 2) indicates which book's bar is focused for tooltip placement.
  function clickToSelect(e, d1, bookNum = 1) {
    // Clicking the already-selected alignment deselects it:
    if (e && d1 === selectedLine) { clearSelectedLine(); return; }

    focusedBookRef.current = bookNum;

    // Apply visual selection only when changing to a different alignment:
    if (d1 !== selectedLine) {
      selectedLine && clearSelectedLine();
      selectedLine = d1;
      setSelectedD(d1);
      selectedDRef.current = d1; // sync update so mouseOver sees it immediately
      getConnections()
        .each(function(d) { d.hidden = d !== d1; })
        .filter(d => d.hidden).attr("opacity", 0.1);
      getBars().filter(d => d.hidden).attr("opacity", 0.1);
      drawingG.selectAll(".dotted-bar-lines").attr("opacity", 0);
    }

    // Update tooltip position: from mouse event, or computed from the focused bar:
    if (e) {
      tooltipPosRef.current = { layerX: e.layerX, layerY: e.layerY };
    } else {
      const selector = bookNum === 1 ? "#firstchart .bar" : "#secondchart .bar";
      const barNode = drawingG?.selectAll(selector).filter(d => d === d1).node();
      if (barNode) {
        const barRect = barNode.getBoundingClientRect();
        const boxRect = document.getElementById("chartBox")?.getBoundingClientRect();
        if (boxRect) {
          tooltipPosRef.current = {
            layerX: barRect.left - boxRect.left + barRect.width / 2,
            layerY: barRect.top  - boxRect.top  + barRect.height / 2,
          };
        }
      }
    }

    mouseOver(e, d1);
  }

  /////////////////// CHART MAIN FUNCTIONS ///////////////////

  // t2
  const normalChart = () => {
    createChart();
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
  };

  /////////////////////////////////////////////////////////////////////

  useEffect(() => {
    // Swap domains before redraw: each panel now shows the other book's content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentXDomain1, currentXDomain2] = [currentXDomain2, currentXDomain1]; // eslint-disable-line react-hooks/exhaustive-deps
    normalChart();
    if (focusedDataIndex) {
      mouseOver(null, chartData?.dataSets[focusedDataIndex]);
      selectLineOnClicked(null, chartData?.dataSets[focusedDataIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped]);

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
          const x = space, y = visMargins.top;
          svg.append("text").attr("class", "download-annotation yLabel")
            .attr("text-anchor", "end").attr("x", x).attr("y", y)
            .attr("transform", `rotate(-90, ${x}, ${y})`)
            .style("font-size", `${axisLabelFontSize}px`).text(line);
          space -= lineHeight;
        });
        space = visMargins.left - yTickWidth - lineHeight;
        labelLinesb2.reverse().forEach((line) => {
          const x = space, y = visMargins.top + 450;
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
          .attr("y", outerHeight - 0.9 * visMargins.bottom)
          .attr("text-anchor", "left").style("font-size", `${axisLabelFontSize}px`)
          .text(textContentb2);
      }
    }
  }, [showDownloadOptions, includeURL, includeMetaInDownload, metaPositionInDownload, // eslint-disable-line react-hooks/exhaustive-deps
      isFlipped, axisLabelFontSize, visMargins, url, yTickWidth, metaData]);

  // Keyboard navigation for selected alignment.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const cur = selectedDRef.current;
      if (!cur) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

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
          clickToSelectRef.current?.(null, next, book);
          panToAlignmentRef.current?.(next);
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
      >
        <VisualizationHeader
          restoreCanvas={restoreCanvas}
          isPairwiseViz={props.isPairwiseViz}
          showDownloadOptions={showDownloadOptions}
          setShowDownloadOptions={setShowDownloadOptions}
        />
      </SectionHeaderLayout>
      <Box
        sx={{
          px: {
            xs: "0px",
            sm: "30px",
          },
        }}
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
            selectLineOnClicked={selectLineOnClicked}
            mouseOver={mouseOver}
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
              sx={{
                minWidth: "180px",
                maxWidth: "200px",
                borderRadius: "5px",
                bgcolor: "#2862a5",
                color: "white",
                position: "absolute",
                top: `${toolTip.layerY - 20}px`,
                left: `${toolTip?.layerX + 15}px`,
                padding: "10px",
                boxSizing: "border-box",
                opacity: 0.8,
              }}
            >
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
                  : toolTip?.data?.book1?.ms}
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                Token Positions{" "}
                {`(${
                  isFlipped
                    ? toolTip?.data?.book2?.pos1
                    : toolTip?.data?.book1?.pos1
                }-${
                  isFlipped
                    ? toolTip?.data?.book2?.pos2
                    : toolTip?.data?.book1?.pos2
                })`}
              </Typography>
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
              </Typography>
              <Typography sx={{ fontSize: "12px" }}>
                Token Positions{" "}
                {`(${
                  isFlipped
                    ? toolTip?.data?.book1?.pos1
                    : toolTip?.data?.book2?.pos1
                }-${
                  isFlipped
                    ? toolTip?.data?.book1?.pos2
                    : toolTip?.data?.book2?.pos2
                })`}
              </Typography>
              {toolTip.isSelected ? (
                <Typography sx={{ fontSize: "11px", mt: "6px", fontStyle: "italic", opacity: 0.85 }}>
                  Press Enter to view aligned text - Right/Left arrow to navigate · Up/Down arrow to switch book · Escape to deselect
                </Typography>
              ) : (
                <Typography sx={{ fontSize: "11px", mt: "6px", fontStyle: "italic", opacity: 0.85 }}>
                  Click to activate arrow key navigation · Double-click to view aligned text
                </Typography>
              )}
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
            selectLineOnClicked={selectLineOnClicked}
            mouseOver={mouseOver}
          />
        </Box>
      </Box>
    </>
  );
};

export default Visual;
