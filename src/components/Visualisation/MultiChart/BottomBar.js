import { useEffect, useRef, useState, useContext } from "react";
import * as d3 from "d3";
import "../../../index.css";
import { bisectLeft, calculateTooltipPos, wrapTextToSvgWidth } from "../../../utility/Helper";
import { Context } from "../../../App";


const BottomBar = (props) => {
  const ref = useRef();
  const isUploadRef = useRef(props.isUpload);
  useEffect(() => { isUploadRef.current = props.isUpload; });
  const onUploadRequestRef = useRef(props.onUploadRequest);
  useEffect(() => { onUploadRequestRef.current = props.onUploadRequest; });
  const { tickFontSize, axisLabelFontSize, yTickWidth } = useContext(Context);
  let height = props.height - props.margin.top - props.margin.bottom;
  let width = props.width;

  const [selectedBar, setSelectedBar] = useState(null); // { id }
  const selectedBarRef = useRef(selectedBar);
  useEffect(() => { selectedBarRef.current = selectedBar; });
  const bookStatsRef = useRef(props.bookStats);
  useEffect(() => { bookStatsRef.current = props.bookStats; });
  const showSelectedTooltipRef = useRef(null);
  // Stored by the main D3 effect so the highlight effect can position elements:
  const xScaleRef = useRef(null);
  const yScaleRef = useRef(null);
  const chartHeightRef = useRef(0);
  const barWidthRef = useRef(0);

  // initialize the svg on mount:
  useEffect(() => {
    const t = `translate(${props.margin.left}, ${props.margin.top})`;
    d3.select(ref.current)
      .html("")
      .append("g")
        .attr("transform", t)
        .attr("class", "bottom-bar");
  },[props.margin.left, props.margin.top, props.dateRange]);

  // create the axes and bars for every change of relevant variables:
  useEffect(() => {
    console.log("updating bottom bar");
    const tooltipDiv = d3.select(".vizTooltip");
    const barSvg = d3.select(".bottom-bar");

    let xScale = d3.scaleLinear()
      .domain([0, props.bookStats.length+2])
      .range([ 0, width ]);
    let maxTotalChMatch = d3.max(props.bookStats, d => d.ch_match);
    let yScale = d3.scaleLinear()
      .domain([maxTotalChMatch, 0])
      .range([0, height]);

    barSvg.selectAll(".bottom-bar-plot").remove();

    // X axis:
    let allYears = props.bookStats.map(d => d.date);
    let tickIndices = [];
    let tickLabelDict = [];
    let prev = 0;
    for (const year of [200,400,600,800,1000,1200,1400]) {
        const i = bisectLeft(allYears, year);
        if (i > prev && i < props.bookStats.length){
          tickIndices.push(props.bookStats[i].bookIndex);
          tickLabelDict[props.bookStats[i].bookIndex] = year;
        }
        prev = i;
    }
    barSvg.selectAll(".xAxis").remove();
    barSvg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
        .tickValues(tickIndices)
        .tickFormat((val) => tickLabelDict[val])
        .tickPadding(2)
      );

    // X axis label:
    barSvg.selectAll(".xLabel").remove();
    const lineHeight = axisLabelFontSize * 1.3;
    const xLabelText = props.hasDates
      ? "Books for which passim detected text reuse with " + props.mainBookURI + " (chronologically arranged)"
      : "Books for which passim detected text reuse with " + props.mainBookURI + " (alphabetically arranged)";
    const xLabelLines = wrapTextToSvgWidth(xLabelText, width, axisLabelFontSize);
    let space = height + props.margin.top + props.margin.bottom;
    xLabelLines.forEach((line) => {
      barSvg.append("text")
        .attr("class", "xLabel")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", space)
        .style("font-size", `${axisLabelFontSize}px`)
        .text(line);
      space += lineHeight;
    });

    // Y axis:
    barSvg.selectAll(".yAxis").remove();
    barSvg.append("g")
      .attr("class", "yAxis")
      .call(d3.axisLeft(yScale)
        .tickFormat(d3.format('.0s'))
        .ticks(3)
        .tickSize(2)
      );
    // Y axis label:
    barSvg.selectAll(".yLabel").remove();
    const labelLines = wrapTextToSvgWidth("Characters reused", 100, axisLabelFontSize);
    let ySpace = -yTickWidth;
    labelLines.reverse().forEach((line) => {
      barSvg.append("text")
        .attr("class", "yLabel")
        .attr("text-anchor", "end")
        .attr("y", ySpace)
        .attr("transform", "rotate(-90)")
        .style("font-size", `${axisLabelFontSize}px`)
        .text(line);
      ySpace -= lineHeight;
    });

    barSvg.selectAll(`.tick text`).style("font-size", `${tickFontSize}px`);

    let barPlot = barSvg.append('g').attr("class", "bottom-bar-plot");
    let barWidth = Math.min(3, width / props.bookStats.length);
    let hitWidth = Math.max(barWidth + 4, 7);

    // Shared event handlers:
    const onMouseover = function(event, d) {
      tooltipDiv.transition().duration(200).style("opacity", .9);
      let tooltipMsg = d.book ?? d.manuscript;
      tooltipMsg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match);
      tooltipMsg += isUploadRef.current
        ? "<br/>(Click to select - double-click to upload pairwise TSV)"
        : "<br/>(Click to select - double-click for pairwise visualisation)";
      const [x, y] = calculateTooltipPos(event, tooltipDiv, tooltipMsg, "multiVis");
      tooltipDiv.html(tooltipMsg).style("left", `${x}px`).style("top", `${y}px`);
    };
    const onMouseout = () => showSelectedTooltipRef.current?.();
    const onClick = function(event, d) {
      if (isUploadRef.current) { onUploadRequestRef.current(d); return; }
      setSelectedBar({ id: d.id });
    };
    const onDblclick = function(event, d) {
      if (isUploadRef.current) return;
      let currentUrl = window.location.href;
      const newUrl = currentUrl.includes("_all")
        ? currentUrl.replace("_all", "_" + d.id)
        : currentUrl.split("&")[0] + "_" + d.id;
      window.open(newUrl, "_blank");
    };

    // Visible bars (pointer-events disabled — hit areas handle interaction):
    barPlot
      .selectAll(".bar")
      .data(props.bookStats, d => d)
      .join(
        enter => enter.append("rect")
          .attr("class", "bar")
          .attr("width", barWidth)
          .attr("y", d => yScale(d.ch_match))
          .attr("x", d => xScale(d.bookIndex) - barWidth / 2)
          .attr("height", d => height - yScale(d.ch_match))
          .style("fill", "#3FB8AF")
          .style("stroke", "#3FB8AF")
          .style("pointer-events", "none"),
        exit => exit.remove()
      );

    // Full-height transparent hit areas for easier clicking:
    barPlot
      .selectAll(".bar-hit")
      .data(props.bookStats, d => d)
      .join(
        enter => enter.append("rect")
          .attr("class", "bar-hit")
          .attr("width", hitWidth)
          .attr("y", 0)
          .attr("x", d => xScale(d.bookIndex) - hitWidth / 2)
          .attr("height", height)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseover", onMouseover)
          .on("mouseout",  onMouseout)
          .on("click",     onClick)
          .on("dblclick",  onDblclick),
        exit => exit.remove()
      );
    // Store for use by the highlight effect:
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;
    chartHeightRef.current = height;
    barWidthRef.current = barWidth;
  }, [props.bookStats, props.height, props.width, props.margin, props.mainBookURI, // eslint-disable-line react-hooks/exhaustive-deps
      props.hasDates, tickFontSize, axisLabelFontSize, yTickWidth]);

  // Highlight selected bar and show persistent tooltip.
  useEffect(() => {
    const marker = selectedBar;
    d3.selectAll('#bottom-bar .bar')
      .style("stroke", d => (marker && d.id === marker.id) ? "#000" : "#3FB8AF")
      .style("stroke-width", d => (marker && d.id === marker.id) ? 2 : 1);
    if (marker) {
      d3.selectAll('#bottom-bar .bar')
        .filter(d => d.id === marker.id)
        .raise();
    }

    // Remove previous highlight band and triangle:
    d3.select('#bottom-bar .bottom-bar').selectAll('.selection-highlight').remove();

    if (marker && xScaleRef.current) {
      const d = bookStatsRef.current?.find(b => b.id === marker.id);
      if (d) {
        const x  = xScaleRef.current(d.bookIndex);
        const h  = chartHeightRef.current;
        const bw = barWidthRef.current;
        const tri = 5;
        const triY = h + 4;
        const g = d3.select('#bottom-bar .bottom-bar');

        // Dotted line from bar's top to max value (y=0):
        const y1 = yScaleRef.current ? yScaleRef.current(d.ch_match) : 0;
        g.append('line')
          .attr('class', 'selection-highlight')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', y1)
          .attr('y2', 0)
          .attr('stroke', '#f90')
          .attr('stroke-width', bw + 2)
          .attr('stroke-dasharray', '3,3')
          .attr('pointer-events', 'none');

        // Option B: downward triangle on the x-axis line:
        g.append('path')
          .attr('class', 'selection-highlight')
          .attr('d', `M${x},${triY} L${x - tri},${triY + tri} L${x + tri},${triY + tri} Z`)
          .attr('fill', '#f90')
          .attr('pointer-events', 'none');
      }
    }

    const showTooltip = (forMarker) => {
      const cur = forMarker !== undefined ? forMarker : selectedBarRef.current;
      const tooltipDiv = d3.select(".vizTooltip");
      tooltipDiv.interrupt();
      if (!cur) { tooltipDiv.style("opacity", 0); return; }
      const d = bookStatsRef.current?.find(b => b.id === cur.id);
      if (!d) { tooltipDiv.style("opacity", 0); return; }
      let tooltipMsg = d.book ?? d.manuscript;
      tooltipMsg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match);
      tooltipMsg += "<br/><b>(Enter for pairwise visualisation - Arrow keys to navigate - Escape to deselect)</b>";
      const bar = d3.select('#bottom-bar').selectAll('.bar').filter(b => b.id === cur.id);
      if (bar.empty()) return;
      const barRect = bar.node().getBoundingClientRect();
      const pageX = barRect.left + barRect.width / 2 + window.scrollX;
      const pageY = barRect.top + window.scrollY;
      const [x, y] = calculateTooltipPos({ pageX, pageY }, tooltipDiv, tooltipMsg, "multiVis");
      tooltipDiv.html(tooltipMsg).style("left", `${x}px`).style("top", `${y}px`).style("opacity", 0.9);
    };

    showSelectedTooltipRef.current = showTooltip;
    showTooltip(selectedBar);
  }, [selectedBar, props.bookStats]);

  // Keyboard navigation — left/right arrows only.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const cur = selectedBarRef.current;
      if (!cur) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const stats = bookStatsRef.current ?? [];
        const idx = stats.findIndex(d => d.id === cur.id);
        if (idx === -1) return;
        const nextIdx = e.key === 'ArrowRight'
          ? (idx + 1) % stats.length
          : (idx - 1 + stats.length) % stats.length;
        const next = stats[nextIdx];
        if (next) {
          const nextMarker = { id: next.id };
          setSelectedBar(nextMarker);
          showSelectedTooltipRef.current?.(nextMarker);
        }
      } else if (e.key === 'Enter') {
        const d = bookStatsRef.current?.find(b => b.id === cur.id);
        if (d) {
          let currentUrl = window.location.href;
          const newUrl = currentUrl.includes("_all")
            ? currentUrl.replace("_all", "_" + d.id)
            : currentUrl.split("&")[0] + "_" + d.id;
          window.open(newUrl, "_blank");
        }
      } else if (e.key === 'Escape') {
        setSelectedBar(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // empty deps — reads current values through refs

  return (
    <svg
      ref={ref}
      id="bottom-bar"
      width={width + props.margin.left + props.margin.right}
      height={props.height + props.margin.top + props.margin.bottom}
      style={{ fontFamily: "Arial" }}
    />
  );
}

export default BottomBar
