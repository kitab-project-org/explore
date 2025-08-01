import { useEffect, useRef, useContext } from "react";
import * as d3 from "d3";
import "../../../index.css";
import { bisectLeft, calculateTooltipPos } from "../../../utility/Helper";
import { Context } from "../../../App";


const BottomBar = (props) => {
  const ref = useRef();
  const { tickFontSize } = useContext(Context);
  let height = props.height - props.margin.top - props.margin.bottom;
  let width = props.width + 2*tickFontSize;

  // initialize the svg on mount:
  useEffect(() => {
    const t = `translate(${props.margin.left}, ${props.margin.top})`;
    d3.select(ref.current)
      .html("")
      .append("g")
        .attr("transform", t)
        .attr("class", "bottom-bar");
  },[props.margin.left, props.margin.top, props.dateRange]);

  // create the axes etc. for every change of relevant variables:
  useEffect(() => {
    console.log("updating bottom bar");
    const tooltipDiv = d3.select(".vizTooltip");
    const barSvg = d3.select(".bottom-bar");
    
    // build X axis scale:
    let xScale = d3.scaleLinear()
      .domain([0, props.bookStats.length+2])  // each book will have its own space on the X axis
      .range([ 0, width ]);
    // build Y axis scale:
    let maxTotalChMatch = d3.max(props.bookStats, d => d.ch_match);
    let yScale = d3.scaleLinear()
      .domain([maxTotalChMatch, 0])
      .range([0, height]);

    // Add X axis:
    let allYears = props.bookStats.map(d => d.date);
    let tickIndices = [];
    let tickLabelDict = [];
    let prev = 0;
    for (const year of [200,400,600,800,1000,1200,1400]) {
        // find the index position of the year in the array:
        const i = bisectLeft(allYears, year);
        if (i > prev && i < props.bookStats.length){
          tickIndices.push(props.bookStats[i].bookIndex);
          tickLabelDict[props.bookStats[i].bookIndex] = year;
        }
        prev = i;
    }
    console.log(tickIndices);
    console.log(tickLabelDict);
    barSvg.selectAll(".xAxis").remove();
    barSvg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
        .tickValues(tickIndices)
        .tickFormat((val,i) => { return tickLabelDict[val]})
        .tickPadding(2)
      );
    // Add X axis label:  see https://stackoverflow.com/a/11194968/4045481
    let xLabelText = "Books for which passim detected text reuse with "+props.mainBookURI+" (chronologically arranged)";
    barSvg.selectAll(".xLabel").remove();
    barSvg.append("text")
      .attr("class", "xLabel")
      .attr("text-anchor", "end")
      .attr("x", width)
      //.attr("y", height + 25)
      .attr("y", height + 20 + tickFontSize)
      .style("font-size", `${tickFontSize}px`)  // replace with axisLabelFontSize
      .text(xLabelText);

    // Add Y axis:
    barSvg.selectAll(".yAxis").remove();
    barSvg.append("g")
      .attr("class", "yAxis")
      .call(d3.axisLeft(yScale)
        .tickFormat(d3.format('.2s'))
        .ticks(4)
        .tickSize(2)
      );
    // Add Y axis label:
    barSvg.selectAll(".yLabel").remove();
    barSvg.append("text")
      .attr("class", "yLabel")
      .attr("text-anchor", "end")
      .attr("y", tickFontSize)  // replace with axisLabelFontSize
      .attr("dy", "-4em")
      .attr("transform", "rotate(-90)")
      .style("font-size", `${tickFontSize}px`)  // replace with axisLabelFontSize
      .text("Characters reused"); 
      
    // update the tick font size
    barSvg
      .selectAll(`.tick text`).style("font-size", `${tickFontSize}px`);

    let barPlot = barSvg.append('g')
      .attr("class", "bottom-bar-plot");
    
    // add/update data:
    let barWidth = Math.min(3, width/props.bookStats.length);
    barPlot
      .selectAll("rect")
      .data(props.bookStats, d => d)
      .join(
        // create a new <rect> tag for the number of 
        // data points that are not yet in the graph:
        enter => (
          enter
            .append("rect")
              .attr("class", "bar")
            .attr("width", barWidth)
            .attr("y", d => yScale(d.ch_match))
            .attr("x", d => xScale(d.bookIndex) - barWidth/2)
            .attr("height", d => height -  yScale(d.ch_match) )
            .style("fill", "#3FB8AF")
            .style("stroke", "#3FB8AF")
            // add tooltip:
            .on("mouseover", function(event, d) {
                // make the tooltip visible:
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                // create the text for the tooltip:
                let tooltipMsg = d.book;
                tooltipMsg += "<br/>Total characters matched: " + d3.format(",")(d.ch_match);
                tooltipMsg += "<br/>(Click bar to see pairwise visualisation)";
                // position the tooltip so that it remains in sight:
                const [x, y] = calculateTooltipPos(event, tooltipDiv, tooltipMsg, "multiVis");
                tooltipDiv.html(tooltipMsg)
                  .style("left", `${x}px`)
                  .style("top", `${y}px`);
            })
            .on("mouseout", function(event, d) {
                // hide the tooltip:
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .on("click", function(event,d){
                // show the book-to-book visualisation
                // in a separate tab:
                let currentUrl = window.location.href;
                let newUrl;
                if (currentUrl.includes("_all")){
                  newUrl = currentUrl.replace("_all", "_"+d.id);
                } else {
                  newUrl = currentUrl.split("&")[0] + "_" + d.id;
                }
                window.open(newUrl, "_blank");
            })
        ),
        /*
        // define the transition between reloads:
        update => (
            update
        ),*/
        // remove superfluous rectangles in the graph:
        exit => (
            exit.call(exit => exit.remove())
        )
      )    
    
  });
  
  return (
    <svg 
      ref={ref}
      id="bottom-bar"
      width={width + props.margin.left + props.margin.right}
      height={props.height + props.margin.top + props.margin.bottom}
    />
  );
}

export default BottomBar