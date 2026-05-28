import { useEffect, useMemo, useRef, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import * as d3 from "d3";
import { Context } from "../../../App";
import { extractAlignment } from "../../../functions/alignmentFunctions";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import { calculateTooltipPos, wrapTextToSvgWidth } from "../../../utility/Helper";


/**
 * Given the currently selected marker {ms1, id2}, return the adjacent marker
 * in the given direction using pre-computed lookup maps.
 *
 * right/left: move between book2s at the same ms1, spilling into the next/prev
 *   ms1 when the edge is reached; wraps around at the global extremes.
 * down/up: move between ms1s within the same book2 column, spilling into the
 *   top/bottom of the next/prev column when the edge is reached.
 */
function getNextMarker(current, direction, navData) {
  const { allSorted, uniqueMs1s, uniqueId2s, dotsByMs1, dotsById2 } = navData;
  if (!allSorted.length) return null;

  if (direction === 'right') {
    const row = dotsByMs1[current.ms1] ?? [];
    const idx = row.findIndex(d => d.id2 === current.id2);
    if (idx < row.length - 1) return { ms1: row[idx + 1].ms1, id2: row[idx + 1].id2 };
    const ms1Idx = uniqueMs1s.indexOf(current.ms1);
    if (ms1Idx < uniqueMs1s.length - 1) {
      const first = (dotsByMs1[uniqueMs1s[ms1Idx + 1]] ?? [])[0];
      return first ? { ms1: first.ms1, id2: first.id2 } : null;
    }
    return { ms1: allSorted[0].ms1, id2: allSorted[0].id2 }; // wrap
  }

  if (direction === 'left') {
    const row = dotsByMs1[current.ms1] ?? [];
    const idx = row.findIndex(d => d.id2 === current.id2);
    if (idx > 0) return { ms1: row[idx - 1].ms1, id2: row[idx - 1].id2 };
    const ms1Idx = uniqueMs1s.indexOf(current.ms1);
    if (ms1Idx > 0) {
      const prevRow = dotsByMs1[uniqueMs1s[ms1Idx - 1]] ?? [];
      const last = prevRow[prevRow.length - 1];
      return last ? { ms1: last.ms1, id2: last.id2 } : null;
    }
    const last = allSorted[allSorted.length - 1];
    return { ms1: last.ms1, id2: last.id2 }; // wrap
  }

  if (direction === 'down') {
    const col = dotsById2[current.id2] ?? [];
    const idx = col.findIndex(d => d.ms1 === current.ms1);
    if (idx < col.length - 1) return { ms1: col[idx + 1].ms1, id2: current.id2 };
    const id2Idx = uniqueId2s.indexOf(current.id2);
    const nextId2 = uniqueId2s[(id2Idx + 1) % uniqueId2s.length];
    const firstInNext = (dotsById2[nextId2] ?? [])[0];
    return firstInNext ? { ms1: firstInNext.ms1, id2: nextId2 } : null;
  }

  if (direction === 'up') {
    const col = dotsById2[current.id2] ?? [];
    const idx = col.findIndex(d => d.ms1 === current.ms1);
    if (idx > 0) return { ms1: col[idx - 1].ms1, id2: current.id2 };
    const id2Idx = uniqueId2s.indexOf(current.id2);
    const prevId2 = uniqueId2s[(id2Idx - 1 + uniqueId2s.length) % uniqueId2s.length];
    const prevCol = dotsById2[prevId2] ?? [];
    const last = prevCol[prevCol.length - 1];
    return last ? { ms1: last.ms1, id2: prevId2 } : null;
  }

  return null;
}

const ScatterPlot = (props) => {
  console.log("ScatterPlot");
  const ref = useRef();
  const bottomOfGraph = useRef(2313543512);
  const isUploadRef = useRef(props.isUpload);
  useEffect(() => { isUploadRef.current = props.isUpload; });
  const versionCode = props.versionCode.split("-")[0];
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    chartData,
    setBooks,
    setBooksAlignment,
    dataLoading,
    setDataLoading,
    setMsPairData,
    mainVersionCode,
    downloadedTexts,
    setDownloadedTexts,
    releaseCode,
    setDisplayMs,
    colors,
    colorScale,
    setColorScale,
    tickFontSize,
    axisLabelFontSize,
    visMargins,
    yTickWidth,
    selectedMarker,
    setSelectedMarker,
    setInitialAlignmentIndex,
  } = useContext(Context);

  // Refs so the keyboard listener (registered once) always sees current values:
  const selectedMarkerRef = useRef(selectedMarker);
  useEffect(() => { selectedMarkerRef.current = selectedMarker; });
  const msdataRef = useRef(props.msdata);
  useEffect(() => { msdataRef.current = props.msdata; });
  const versionCodeRef = useRef(versionCode);
  useEffect(() => { versionCodeRef.current = versionCode; });
  // Ref to handleClickedDot, which is re-defined inside the D3 useEffect:
  const handleClickedDotRef = useRef(null);
  // Ref to the "show selected tooltip" function so mouseout can call it:
  const showSelectedTooltipRef = useRef(null);
  // Guard so the URL-param effect only fires once:
  const urlParamsProcessedRef = useRef(false);

  // Pre-computed lookup maps for O(1) keyboard navigation:
  const navData = useMemo(() => {
    const data = props.msdata ?? [];
    const dotsByMs1 = {};
    for (const d of data) {
      if (!dotsByMs1[d.ms1]) dotsByMs1[d.ms1] = [];
      dotsByMs1[d.ms1].push(d);
    }
    for (const key of Object.keys(dotsByMs1)) {
      dotsByMs1[key].sort((a, b) => a.bookIndex - b.bookIndex);
    }
    const dotsById2 = {};
    for (const d of data) {
      if (!dotsById2[d.id2]) dotsById2[d.id2] = [];
      dotsById2[d.id2].push(d);
    }
    for (const key of Object.keys(dotsById2)) {
      dotsById2[key].sort((a, b) => a.ms1 - b.ms1);
    }
    const allSorted = [...data].sort((a, b) => a.ms1 - b.ms1 || a.bookIndex - b.bookIndex);
    const uniqueMs1s = [...new Set(data.map(d => d.ms1))].sort((a, b) => a - b);
    const uniqueId2s = [...new Set(data.map(d => d.id2))];
    uniqueId2s.sort((a, b) => (dotsById2[a]?.[0]?.bookIndex ?? 0) - (dotsById2[b]?.[0]?.bookIndex ?? 0));
    return { allSorted, uniqueMs1s, uniqueId2s, dotsByMs1, dotsById2 };
  }, [props.msdata]);
  const navDataRef = useRef(navData);
  useEffect(() => { navDataRef.current = navData; }, [navData]);

  const width = props.width;


  // create the color scale, based on the ch_match values:
  useEffect(() => {
    if (props.msdata){
      console.log(props.msdata);
      // try to distribute the values evenly along the colors
      // (sequential scale does not give great results): 
      // calculate the quantile thresholds for all ch_match values except the max value
      // (so that the max value is the only one that gets to be black):
      let quantileScale = d3.scaleQuantile()
        .domain(props.msdata.map(
          d => d.ch_match).filter(x => x < props.maxChMatch-1))
        .range([1,2,3,4,5,6,7,8,9,10]) // get 10 quantiles; the 11th will be for the main book
      // get the array of quantile thresholds and add the maxMatch value to it:
      let quantiles = quantileScale.quantiles();
      // add the maxValue, for the main text:
      quantiles.push(props.maxChMatch-1);
      // round the thresholds to integers:
      quantiles = quantiles.map(x => Math.round(x));
      // use these thresholds to create a new threshold scale
      // (number of colors needs to be one larger than number of thresholds)      
      const colScale = d3.scaleThreshold(quantiles, colors);
      setColorScale(() => colScale);
    } else {
      console.log("props.msdata not defined!");
    }
    // eslint-disable-next-line
  }, []); 
  //}, [colors, props.maxChMatch, props.msdata, setColorScale]);  // deps array leads to infinite loop!
  
  // initialize the svg on mount:
  useEffect(() => {
    //let t = `translate(${props.margin.left}, ${props.margin.top})`;
    let t = `translate(${visMargins.left}, ${visMargins.top})`;
    d3.select(ref.current)
      .html("")
      .append("g")
        .attr("transform", t)
        .attr("class", "scatter-plot");
    /*// add a grey background: 
    g.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "lightgrey");*/
  }, [visMargins]);
  //},[props.margin.left, props.margin.top]);

  // create the axes etc. for every change of relevant variables:
  useEffect(() => {
    console.log("updating scatter");

    async function handleClickedDot(e, d, alignIndex = 0) {
      console.log("Dot clicked: ");
      console.log(d);

      // Capture all alignments before d is reshaped below:
      const originalAlignments = d.alignments;
      // s1FromData is undefined when the uploaded TSV has no s1/s2 column:
      const s1FromData = originalAlignments[0].s1;

      d = {
        ms1: d.ms1,
        id2: d.id2,
        date: d.date,
        bookIndex: d.bookIndex,
        ms2: originalAlignments[0].ms2,
        b1: originalAlignments[0].b1,
        e1: originalAlignments[0].e1,
        b2: originalAlignments[0].b2,
        e2: originalAlignments[0].e2,
        matches_percent: originalAlignments[0].matches_percent,
        ch_match: originalAlignments[0].ch_match,
        id: originalAlignments[0].id,
      }

      // setting the msPairData will trigger a re-render!
      let versionCode2 = d.id2.split("-")[0];
      setMsPairData({
        book1: { versionCode: mainVersionCode, b: d.b1, e: d.e1, ms: d.ms1 },
        book2: { versionCode: versionCode2, b: d.b2, e: d.e2, ms: d.ms2 },
      });

      if (isUploadRef.current && s1FromData !== undefined) {
        // Build one entry per alignment from TSV s1/s2 strings:
        const allAlignments = originalAlignments.map(al => ({
          ms2: al.ms2,
          s1: al.s1,
          s2: al.s2,
          bw1: null, ew1: null, bw2: null, ew2: null,
          bc1: null, ec1: null, bc2: null, ec2: null,
          beforeAlignment1: "",
          afterAlignment1: "",
          beforeAlignment2: "",
          afterAlignment2: "",
        }));
        // setBooks must be called (with null content) to make the Books
        // component mount — it only renders when `books` state is truthy:
        setBooks({
          book1: {
            versionCode: mainVersionCode,
            title: chartData.bookUriDict[mainVersionCode]?.[0] ?? mainVersionCode,
            content: null,
            ms: d?.ms1,
            first_ms: null,
            last_ms: null,
          },
          book2: {
            versionCode: versionCode2,
            title: chartData.bookUriDict[d.id2]?.[0] ?? d.id2,
            content: null,
            ms: d?.ms2,
            first_ms: null,
            last_ms: null,
          },
        });
        if (alignIndex > 0) setInitialAlignmentIndex(alignIndex);
        setBooksAlignment(allAlignments);
      } else {
        setDataLoading({ ...dataLoading, books: true });

        // Fetch ms1 text once — it is the same for every alignment in this dot:
        const ms1Text = await getMilestoneText(
          releaseCode, mainVersionCode, d.ms1, downloadedTexts, setDownloadedTexts
        );

        // Fetch ms2 text and extract strings for every alignment in parallel.
        // getMilestoneText caches by milestone file, so alignments in the same
        // 300-milestone chunk cost only one network request after the first:
        const allAlignments = await Promise.all(
          originalAlignments.map(async (al) => {
            const ms2Text = await getMilestoneText(
              releaseCode, versionCode2, al.ms2, downloadedTexts, setDownloadedTexts
            );
            const [s1, startChar1, endChar1] = extractAlignment(ms1Text, al.b1, al.e1, "char");
            const [s2, startChar2, endChar2] = extractAlignment(ms2Text, al.b2, al.e2, "char");
            return {
              ms2: al.ms2,
              s1,
              s2,
              bw1: null, ew1: null, bw2: null, ew2: null,
              bc1: startChar1, ec1: endChar1,
              bc2: startChar2, ec2: endChar2,
              beforeAlignment1: ms1Text.slice(0, startChar1),
              afterAlignment1: ms1Text.slice(endChar1),
              beforeAlignment2: ms2Text.slice(0, startChar2),
              afterAlignment2: ms2Text.slice(endChar2),
            };
          })
        );

        setDataLoading({ ...dataLoading, books: false });

        let b1Downloaded = downloadedTexts[releaseCode][mainVersionCode]["downloadedMs"];
        let b2Downloaded = downloadedTexts[releaseCode][versionCode2]["downloadedMs"];

        setBooks({
          book1: {
            versionCode: mainVersionCode,
            title: chartData.bookUriDict[mainVersionCode]?.[0] ?? mainVersionCode,
            content: b1Downloaded?.msTexts,
            ms: d?.ms1,
            first_ms: null,
            last_ms: null,
          },
          book2: {
            versionCode: versionCode2,
            title: chartData.bookUriDict[d.id2]?.[0] ?? d.id2,
            content: b2Downloaded,
            ms: d?.ms2,
            first_ms: null,
            last_ms: null,
          },
        });

        setDisplayMs({ book1: {}, book2: {} });
        if (alignIndex > 0) setInitialAlignmentIndex(alignIndex);
        setBooksAlignment(allAlignments);
      }

      document.getElementById("belowBooks").scrollIntoView({behavior: "smooth", block: "end"});
    };
    // Keep the ref current so the keyboard listener can call this function:
    handleClickedDotRef.current = handleClickedDot;
    //}, [chartData.bookUriDict, dataLoading, downloadedTexts, getMilestoneText,
    //    mainVersionCode, metaData, releaseCode, setBooks, setBooksAlignment, setDataLoading, setDisplayMs, setMsPairData]);

    const tooltipDiv = d3.select(".vizTooltip");

    const scatterPlot = d3.select(".scatter-plot");
    
    // create X and Y scaling functions:
    let xScale = d3.scaleLinear()
      .domain([0, props.bookStats.length+2])  // each book will have its own space on the X axis
      .range([ 0, width ]); // props.width ]);
    let yScale = d3.scaleLinear()
      .domain([props.msRange[1]+1, props.msRange[0]-1])   // flip the axis!
      .range([props.height, 0]);

    // Add/update X axis in-place (avoid remove+append which triggers mouseover on re-render):
    scatterPlot.selectAll(".xAxis")
      .data([null])
      .join("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + props.height + ")")
        .style("font-size", `${tickFontSize}px`)
        .call(d3.axisBottom(xScale)
          .tickFormat(() => '')
          .tickSize(0)
        );

    // Add/update Y axis in-place:
    scatterPlot.selectAll(".yAxis")
      .data([null])
      .join("g")
        .attr("class", "yAxis")
        .style("font-size", `${tickFontSize}px`)
        .call(d3.axisLeft(yScale)
          .tickSize(2)
          .tickPadding(5)
          .tickFormat((val) => val === 0 ? null : val)
        );

    // Add/update Y axis label in-place:
    const lineHeight = 1.3*axisLabelFontSize;
    const bookLabel = "Milestones in "+props.mainBookURI;
    const labelLines = wrapTextToSvgWidth(
      bookLabel,
      props.height-visMargins.top,
      axisLabelFontSize
    );
    labelLines.reverse();
    scatterPlot.selectAll(".yLabel")
      .data(labelLines)
      .join("text")
        .attr("class", "yLabel")
        .attr("text-anchor", "end")
        .attr("x", (_, i) => -(yTickWidth + 8) - i * lineHeight)
        .attr("y", 0)
        .attr("transform", (_, i) => {
          const x = -(yTickWidth + 8) - i * lineHeight;
          return `rotate(-90, ${x}, 0)`;
        })
        .style("font-size", `${axisLabelFontSize}px`)
        .text(d => d);

    // update the tick font size
    scatterPlot
      .selectAll(`.tick text`).style("font-size", `${tickFontSize}px`);

    // add/update data:
    scatterPlot
      .selectAll("circle")
      .data(props.msdata, d => `${d.ms1}_${d.id2}`)
      .join(
        // create a new <circle> tag for the number of
        // data points that are not yet in the graph:
        enter => {
          console.log("[enter] creating", enter.size(), "circles");
          return enter
            .append("circle")
              .attr("class", "dot")
              .attr("cx", function (d) { return xScale(d.bookIndex); } )
              .attr("cy", function (d) { return yScale(d.ms1); } )
              .attr("r", props.dotSize)
              .style("fill", function (d) { return colorScale(d.ch_match) } )
              .style("cursor", function (d) {
                const hasStrings = d.alignments[0]?.s1 !== undefined;
                return ((!props.isUpload || hasStrings) && d.id2 !== versionCode) ? "pointer" : "default";
              })
              // add tooltip:
              .on("mouseover", function(event, d) {
                // make the tooltip visible:
                tooltipDiv.transition().duration(200).style("opacity", .9);
                // create the text for the tooltip:
                let tooltipMsg = "";
                if (d.id2 !== versionCode) {
                  tooltipMsg += `<b>${props.bookUriDict[d.id2]}</b>`
                  tooltipMsg += (d.alignments.length < 2)
                    ? ` (Milestone ${d.alignments[0].ms2})`
                    : ` (Milestones ${d.alignments.map(el => el.ms2)})`;
                  tooltipMsg += `<br/>aligns with Milestone ${d.ms1} in ${props.mainBookURI}`;
                  tooltipMsg += `<br/><br/>Characters matched: ${d.ch_match}`;
                  const hasStrings = d.alignments[0]?.s1 !== undefined;
                  if (!props.isUpload || hasStrings) {
                    tooltipMsg += "<br/><br/><b>(Double-click to compare - click to select for keyboard navigation)</b>";
                  } else {
                    tooltipMsg += "<br/><br/>(Text comparison not available for uploaded files)";
                  }
                } else {
                  tooltipMsg += `Milestone ${d.ms1} in ${props.mainBookURI}`;
                }
                const [x, y] = calculateTooltipPos(event, tooltipDiv, tooltipMsg, "multiVis");
                tooltipDiv.html(tooltipMsg)
                  .style("left", `${x}px`)
                  .style("top", `${y}px`);
              })
              .on("mouseout", function(event, d) {
                showSelectedTooltipRef.current?.();
              })
              .on("click", function(event, d){
                const hasStrings = d.alignments[0]?.s1 !== undefined;
                if (d.id2 !== versionCode && (!isUploadRef.current || hasStrings)) {
                  setSelectedMarker({ ms1: d.ms1, id2: d.id2 });
                }
              })
              .on("dblclick", function(event, d){
                const hasStrings = d.alignments[0]?.s1 !== undefined;
                if (d.id2 !== versionCode && (!isUploadRef.current || hasStrings)) {
                  setSelectedMarker({ ms1: d.ms1, id2: d.id2 });
                  handleClickedDot(event, d);
                }
              })
            .call(enter => enter.transition().duration(100));
        },
        // UPDATE: refresh attributes in-place so circles are never removed+reinserted
        // (DOM re-insertion would trigger mouseover on whichever circle is under the cursor)
        update => update
          .attr("cx", d => xScale(d.bookIndex))
          .attr("cy", d => yScale(d.ms1))
          .attr("r", props.dotSize)
          .style("fill", d => colorScale(d.ch_match)),
        // EXIT: remove circles for data points no longer present
        exit => {
          console.log("[exit] removing", exit.size(), "circles");
          exit.remove();
        }
      )
  }, [props.msdata, props.bookStats.length, props.msRange, props.height, width,
      tickFontSize, axisLabelFontSize, props.mainBookURI, props.mainBookMilestones,
      visMargins, yTickWidth,
      props.dotSize, colorScale, props.bookUriDict, props.isUpload, versionCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show/hide URL text in the SVG for download — kept separate so toggling the
  // download panel doesn't re-run the expensive main D3 effect.
  useEffect(() => {
    d3.select("#scatterChart").selectAll(".url-label").remove();
    if (props.showDownloadOptions && props.includeURL) {
      const urlFontSize = Math.min(axisLabelFontSize, 12);
      const lines = wrapTextToSvgWidth(window.location.href, props.width, urlFontSize);
      lines.forEach((line, i) => {
        d3.select("#scatterChart").append("text")
          .attr("class", "url-label")
          .attr("x", visMargins.left)
          .attr("y", urlFontSize * 1.3 * (i + 1))
          .attr("text-anchor", "left")
          .style("font-size", `${urlFontSize}px`)
          .style("text-decoration", "underline")
          .text(line);
      });
    }
  }, [props.showDownloadOptions, props.includeURL, visMargins, axisLabelFontSize, searchParams, props.width]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation — document-level so it works regardless of scroll position.
  // Uses refs so the listener registered once always sees current data.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const cur = selectedMarkerRef.current;
      if (!cur) return;
      // Don't intercept while the user is typing:
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

      const dirMap = { ArrowRight: 'right', ArrowLeft: 'left', ArrowDown: 'down', ArrowUp: 'up' };
      if (dirMap[e.key]) {
        e.preventDefault();
        const next = getNextMarker(cur, dirMap[e.key], navDataRef.current);
        if (next) {
          console.log("[keydown] navigating to", next);
          setSelectedMarker(next);
          // Show the tooltip synchronously now, before React re-renders and before
          // any mouseover can fire on the circle under the cursor:
          console.log("[keydown] calling showTooltip, ref is", showSelectedTooltipRef.current ? "set" : "null");
          showSelectedTooltipRef.current?.(next);
          console.log("[keydown] after showTooltip, tooltip left is", d3.select(".vizTooltip").style("left"));
        }
      } else if (e.key === 'Enter') {
        const dot = msdataRef.current?.find(d => d.ms1 === cur.ms1 && d.id2 === cur.id2);
        if (dot && handleClickedDotRef.current) handleClickedDotRef.current(null, dot);
      } else if (e.key === 'Escape') {
        setSelectedMarker(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // empty deps — reads all current values through refs

  // Highlight the selected dot and show the persistent tooltip near it.
  // The function is stored in showSelectedTooltipRef so mouseout can re-show it.
  useEffect(() => {
    const marker = selectedMarker;
    d3.selectAll("circle.dot")
      .style("stroke", d => (marker && d.ms1 === marker.ms1 && d.id2 === marker.id2) ? "#000" : "none")
      .style("stroke-width", d => (marker && d.ms1 === marker.ms1 && d.id2 === marker.id2) ? 2 : 0);

    // showTooltip accepts an optional marker; falls back to selectedMarkerRef.current
    // so that mouseout (which calls it with no args) always uses the latest selection:
    const showTooltip = (forMarker) => {
      const curMarker = forMarker !== undefined ? forMarker : selectedMarkerRef.current;
      const tooltipDiv = d3.select(".vizTooltip");
      // Cancel any in-progress D3 transition so position/opacity update immediately:
      tooltipDiv.interrupt();
      if (!curMarker) {
        tooltipDiv.style("opacity", 0);
        return;
      }
      const dot = props.msdata?.find(d => d.ms1 === curMarker.ms1 && d.id2 === curMarker.id2);
      if (!dot || dot.id2 === versionCode) { tooltipDiv.style("opacity", 0); return; }
      let tooltipMsg = `<b>${props.bookUriDict[dot.id2]}</b>`;
      tooltipMsg += (dot.alignments.length < 2)
        ? ` (Milestone ${dot.alignments[0].ms2})`
        : ` (Milestones ${dot.alignments.map(el => el.ms2)})`;
      tooltipMsg += `<br/>aligns with Milestone ${dot.ms1} in ${props.mainBookURI}`;
      tooltipMsg += `<br/><br/>Characters matched: ${dot.ch_match}`;
      tooltipMsg += "<br/><br/><b>(Press Enter or double-click to view the text - Arrow keys to navigate - Escape to deselect)</b>";
      const circle = d3.select("#scatterChart").selectAll("circle.dot")
        .filter(d => d.ms1 === curMarker.ms1 && d.id2 === curMarker.id2);
      if (circle.empty()) return;
      const circleNode = circle.node();
      const circleRect = circleNode.getBoundingClientRect();
      const pageX = circleRect.left + circleRect.width / 2 + window.scrollX;
      const pageY = circleRect.top  + circleRect.height / 2 + window.scrollY;
      const [x, y] = calculateTooltipPos({ pageX, pageY }, tooltipDiv, tooltipMsg, "multiVis");
      tooltipDiv
        .html(tooltipMsg)
        .style("left", `${x}px`)
        .style("top",  `${y}px`)
        .style("opacity", 0.9);
    };

    showSelectedTooltipRef.current = showTooltip;
    showTooltip(selectedMarker); // pass from closure so it's correct even if ref lags

  }, [selectedMarker, props.msdata, props.bookUriDict, props.mainBookURI, versionCode]);

  // Sync selectedMarker → URL params (ms1, id2) on user interaction.
  useEffect(() => {
    if (!selectedMarker) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("ms1", selectedMarker.ms1.toString());
      next.set("id2", selectedMarker.id2);
      return next;
    }, { replace: true });
  }, [selectedMarker]); // eslint-disable-line react-hooks/exhaustive-deps

  // Select a dot and load its diff from URL params (ms1, id2, align_no / ms2).
  // Runs once when msdata first becomes available; the ref guard prevents re-firing.
  useEffect(() => {
    if (urlParamsProcessedRef.current) return;
    if (!props.msdata?.length || !handleClickedDotRef.current) return;

    const ms1Param = searchParams.get("ms1");
    const id2Param = searchParams.get("id2");
    if (!ms1Param || !id2Param) return;

    const ms1 = parseInt(ms1Param, 10);
    const id2Base = id2Param.split("-")[0];
    const dot = props.msdata.find(d => d.ms1 === ms1 && d.id2 === id2Param)
      ?? props.msdata.find(d => d.ms1 === ms1 && d.id2 === id2Base);
    if (!dot) return;

    urlParamsProcessedRef.current = true;

    // Resolve which alignment to open:
    // align_no is 1-based; ms2 selects by milestone number.
    let alignIndex = 0;
    const alignNoParam = searchParams.get("align_no");
    const ms2Param    = searchParams.get("ms2");
    if (alignNoParam !== null) {
      alignIndex = Math.max(0, parseInt(alignNoParam, 10) - 1);
    } else if (ms2Param !== null) {
      const ms2 = parseInt(ms2Param, 10);
      const idx = dot.alignments.findIndex(al => al.ms2 === ms2);
      if (idx >= 0) alignIndex = idx;
    }

    setSelectedMarker({ ms1: dot.ms1, id2: dot.id2 });
    handleClickedDotRef.current(null, dot, alignIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.msdata]);

  return (
    <Box 
      id={"chartBox"} 
      sx={{ width: "100%", position: "relative" }}
    >

      <svg 
        id={"scatterChart"}
        ref={ref}
        width={width + visMargins.left + visMargins.right}
        height={props.height + visMargins.top + tickFontSize}
        style={{ fontFamily: "Arial" }}
      />
      <div ref={bottomOfGraph}/>
    </Box>
  )

};

export default ScatterPlot;
