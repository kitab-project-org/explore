import { useEffect, useRef, useContext } from "react";
import * as d3 from "d3";
import "../../../index.css";
import { calculateTooltipPos, wrapTextToSvgWidth } from "../../../utility/Helper";
import { getMilestoneHeadings } from "../../../utility/TocHelper";
import { Context } from "../../../App";


const SideBar = (props) => {
  const ref = useRef();
  const { tickFontSize, axisLabelFontSize } = useContext(Context);
  const tocRef = useRef(props.toc);
  useEffect(() => { tocRef.current = props.toc; });

  const { selectedMs, setSelectedMs } = props;
  const selectedMsRef = useRef(selectedMs);
  useEffect(() => { selectedMsRef.current = selectedMs; });
  const msStatsRef = useRef(props.msStats);
  useEffect(() => { msStatsRef.current = props.msStats; });
  const showSelectedTooltipRef = useRef(null);
  // Stored by the main D3 effect for use by the highlight effect:
  const xScaleRef = useRef(null);
  const yScaleRef = useRef(null);
  const barHeightRef = useRef(0);

  // initialize the svg on mount (or when margin/font changes):
  useEffect(() => {
    const t = `translate(${tickFontSize}, ${props.margin.top})`;
    d3.select(ref.current)
      .html("")
      .append("g")
        .attr("transform", t)
        .attr("class", "side-bar");
  }, [tickFontSize, props.margin.top]); // eslint-disable-line react-hooks/exhaustive-deps

  // create the axes and bars for every change of relevant variables:
  useEffect(() => {
    console.log("updating side bar");
    const tooltipDiv = d3.select(".vizTooltip");
    const barSvg = d3.select(".side-bar");

    let maxTotalChMatch = d3.max(props.msStats, d => d.ch_match_total);
    let xScale = d3.scaleLinear()
      .domain([0, maxTotalChMatch])
      .range([0, props.width]);
    let yScale = d3.scaleLinear()
      .domain([props.msRange[1]+1, props.msRange[0]-1])
      .range([props.height, 0]);

    // X axis:
    barSvg.selectAll(".xAxis").remove();
    barSvg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + props.height + ")")
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.format('.0s'))
        .ticks(2)
        .tickSize(2)
        .tickPadding(5)
      );
    // X axis label:
    barSvg.selectAll(".xLabel").remove();
    const lineHeight = axisLabelFontSize * 1.3;
    const labelLines = wrapTextToSvgWidth("Characters reused", 120, axisLabelFontSize);
    let ySpace = -axisLabelFontSize;
    labelLines.reverse().forEach((line) => {
      barSvg.append("text")
        .attr("class", "xLabel")
        .attr("text-anchor", "left")
        .attr("y", ySpace)
        .style("font-size", `${axisLabelFontSize}px`)
        .text(line);
      ySpace -= lineHeight;
    });

    // Y axis:
    barSvg.selectAll(".yAxis").remove();
    barSvg.append("g")
      .attr("class", "yAxis")
      .call(d3.axisLeft(yScale)
        .tickFormat(() => '')
        .tickSize(0)
      );

    barSvg.selectAll(`.tick text`).style("font-size", `${tickFontSize}px`);

    barSvg.selectAll(".side-bar-plot").remove();
    let barPlot = barSvg.append('g').attr("class", "side-bar-plot");

    let barHeight = Math.min(3, props.height / props.msStats.length);
    let hitHeight = Math.max(barHeight + 4, 7);

    // Shared handlers:
    const buildTooltipMsg = (d) => {
      let msg = "Milestone " + d.ms_id + ":";
      msg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match_total);
      const headings = getMilestoneHeadings(tocRef.current, d.ms_id);
      if (headings) msg += "<br/><b>Section(s):</b>" + headings;
      msg += "<br/><b>(click to enable navigation)</b>";
      return msg;
    };
    const onMouseover = function(event, d) {
      tooltipDiv.transition().duration(200).style("opacity", .9);
      const msg = buildTooltipMsg(d);
      const [x, y] = calculateTooltipPos(event, tooltipDiv, msg, "multiVis");
      tooltipDiv.html(msg).style("left", `${x}px`).style("top", `${y}px`);
    };
    const onMouseout = () => showSelectedTooltipRef.current?.();
    const onClick = (event, d) => setSelectedMs({ ms_id: d.ms_id });

    // Visible bars (pointer-events disabled):
    barPlot.selectAll(".bar")
      .data(props.msStats, d => d)
      .join(
        enter => enter.append("rect")
          .attr("class", "bar")
          .attr("height", barHeight)
          .attr("y", d => yScale(d.ms_id))
          .attr("x", 0)
          .attr("width", d => xScale(d.ch_match_total))
          .style("fill", "#3FB8AF")
          .style("stroke", "#3FB8AF")
          .style("pointer-events", "none"),
        exit => exit.remove()
      );

    // Full-width transparent hit areas:
    barPlot.selectAll(".bar-hit")
      .data(props.msStats, d => d)
      .join(
        enter => enter.append("rect")
          .attr("class", "bar-hit")
          .attr("height", hitHeight)
          .attr("y", d => yScale(d.ms_id) - hitHeight / 2)
          .attr("x", 0)
          .attr("width", props.width)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseover", onMouseover)
          .on("mouseout",  onMouseout)
          .on("click",     onClick),
        exit => exit.remove()
      );

    // Store for highlight effect:
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;
    barHeightRef.current = barHeight;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.msStats, props.height, props.mainBookMilestones, props.msRange,
      props.width, tickFontSize, axisLabelFontSize, props.margin.top, setSelectedMs]);

  // Highlight selected bar and show persistent tooltip.
  useEffect(() => {
    const marker = selectedMs;
    d3.selectAll('#side-bar .bar')
      .style("stroke", d => (marker && d.ms_id === marker.ms_id) ? "#000" : "#3FB8AF")
      .style("stroke-width", d => (marker && d.ms_id === marker.ms_id) ? 2 : 1);
    if (marker) {
      d3.selectAll('#side-bar .bar')
        .filter(d => d.ms_id === marker.ms_id)
        .raise();
    }

    d3.select('#side-bar .side-bar-plot').selectAll('.selection-highlight').remove();

    if (marker && yScaleRef.current) {
      const d = msStatsRef.current?.find(b => b.ms_id === marker.ms_id);
      if (d) {
        const y  = yScaleRef.current(d.ms_id);
        const bh = barHeightRef.current;
        const g = d3.select('#side-bar .side-bar-plot');

        // Dotted line from bar's right edge to max value:
        const x1 = xScaleRef.current ? xScaleRef.current(d.ch_match_total) : 0;
        g.append('line')
          .attr('class', 'selection-highlight')
          .attr('x1', x1)
          .attr('x2', props.width)
          .attr('y1', y + bh / 2)
          .attr('y2', y + bh / 2)
          .attr('stroke', '#f90')
          .attr('stroke-width', bh + 2)
          .attr('stroke-dasharray', '3,3')
          .attr('pointer-events', 'none');

        // Right-pointing triangle to the left of the Y axis:
        const tri = 5;
        const tipX = -2;
        g.append('path')
          .attr('class', 'selection-highlight')
          .attr('d', `M${tipX},${y} L${tipX - tri},${y - tri} L${tipX - tri},${y + tri} Z`)
          .attr('fill', '#f90')
          .attr('pointer-events', 'none');
      }
    }

    const showTooltip = (forMarker) => {
      const cur = forMarker !== undefined ? forMarker : selectedMsRef.current;
      const tooltipDiv = d3.select(".vizTooltip");
      tooltipDiv.interrupt();
      if (!cur) { tooltipDiv.style("opacity", 0); return; }
      const d = msStatsRef.current?.find(b => b.ms_id === cur.ms_id);
      if (!d) { tooltipDiv.style("opacity", 0); return; }
      let msg = "Milestone " + d.ms_id + ":";
      msg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match_total);
      const headings = getMilestoneHeadings(tocRef.current, d.ms_id);
      if (headings) msg += "<br/><b>Section(s):</b>" + headings;
      msg += "<br/><b>(Arrow keys to navigate - Escape to deselect)</b>";
      const bar = d3.select('#side-bar').selectAll('.bar').filter(b => b.ms_id === cur.ms_id);
      if (bar.empty()) return;
      const barRect = bar.node().getBoundingClientRect();
      const pageX = barRect.right + window.scrollX;
      const pageY = barRect.top + barRect.height / 2 + window.scrollY;
      const [x, y] = calculateTooltipPos({ pageX, pageY }, tooltipDiv, msg, "multiVis");
      tooltipDiv.html(msg).style("left", `${x}px`).style("top", `${y}px`).style("opacity", 0.9);
    };

    showSelectedTooltipRef.current = showTooltip;
    showTooltip(selectedMs);
  }, [selectedMs, props.msStats, props.width]);

  // Keyboard navigation — up/down arrows only.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const cur = selectedMsRef.current;
      if (!cur) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const stats = [...(msStatsRef.current ?? [])].sort((a, b) => a.ms_id - b.ms_id);
        const idx = stats.findIndex(d => d.ms_id === cur.ms_id);
        if (idx === -1) return;
        // ArrowUp = lower ms_id (visually up in chart); ArrowDown = higher ms_id
        const nextIdx = e.key === 'ArrowUp'
          ? (idx - 1 + stats.length) % stats.length
          : (idx + 1) % stats.length;
        const next = stats[nextIdx];
        if (next) {
          const nextMarker = { ms_id: next.ms_id };
          setSelectedMs(nextMarker);
          showSelectedTooltipRef.current?.(nextMarker);
        }
      } else if (e.key === 'Escape') {
        setSelectedMs(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      ref={ref}
      id="side-bar"
      width={props.width + props.margin.left + props.margin.right}
      height={props.height + props.margin.top + props.margin.bottom}
      style={{ fontFamily: "Arial" }}
    />
  );
}

export default SideBar
