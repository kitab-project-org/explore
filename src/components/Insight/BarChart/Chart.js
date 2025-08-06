import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { convertNumberToMillions } from "../../../utility/Helper";

function Chart({ width, height, data }) {
  const svgRef = useRef();

  useEffect(() => {
    drawChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, width, height]);

  const drawChart = () => {
    const svg = d3.select(svgRef.current);

    // Clear the previous content
    svg.selectAll("*").remove();

    const margin = { top: 0, right: 20, bottom: 30, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yScale = d3
      .scaleBand()
      .domain(data.map((d, i) => i))
      .range([0, innerHeight])
      .padding(0.2);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value.tok_length)])
      .nice()
      .range([0, innerWidth]);

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const bars = g
      .selectAll(".barA")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "barA");

    // Define the gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "barGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(40, 98, 165, 0.5)");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(40, 98, 165)");

    bars
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => yScale(i))
      .attr("width", (d) => xScale(d.value.tok_length))
      .attr("height", 30)
      .attr("fill", "url(#barGradient)");

    // Adding text labels inside the bars
    bars
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => xScale(d.value.tok_length) - 10) // Adjust the x position to start from the right
      .attr("y", (d, i) => yScale(i) + 30 / 2) // Center the text vertically
      .attr("dy", "0.35em")
      .attr("fill", "white") // Set the text color
      .attr("text-anchor", "end") // Align the text to the end of the bar
      .text(
        (d) => `${d.title} - ${convertNumberToMillions(d.value.tok_length)}`
      );
  };

  return (
    <div className="chart">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default Chart;
