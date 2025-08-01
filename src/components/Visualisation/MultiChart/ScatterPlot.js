import { useEffect, useRef, useContext } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";
import { Context } from "../../../App";
import { extractAlignment } from "../../../functions/alignmentFunctions";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import { calculateTooltipPos } from "../../../utility/Helper";


const ScatterPlot = (props) => {
  console.log("ScatterPlot");
  const ref = useRef();
  const bottomOfGraph = useRef(2313543512)
  const versionCode = props.versionCode.split("-")[0];
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
    showDownloadOptions,
    includeURL,
    url
    //axisLabelFontSize
  } = useContext(Context);

  const width = props.width + 2*tickFontSize;


  // create the color scale, based on the ch_match values:
  useEffect(() => {
    if (props.msdata){
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
    } 
    // eslint-disable-next-line
  }, []); 
  //}, [colors, props.maxChMatch, props.msdata, setColorScale]);  // deps array leads to infinite loop!
  
  // initialize the svg on mount:
  useEffect(() => {
    let t = `translate(${props.margin.left}, ${props.margin.top})`;
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
  },[props.margin.left, props.margin.top]);

  // create the axes etc. for every change of relevant variables:
  useEffect(() => {
    console.log("updating scatter");

    async function handleClickedDot(e, d) {
    //const handleClickedDot = useCallback(async function (e, d) {
      console.log("Dot clicked: ");
      console.log(d);

      // TO DO: for the moment, we only show the first milestone from book2
      // that has text reuse in common with the main milestone!
      d = {
        ms1: d.ms1,
        id2: d.id2,
        date: d.date,
        bookIndex: d.bookIndex,
        ms2: d.alignments[0].ms2,
        b1: d.alignments[0].b1,
        e1: d.alignments[0].e1,
        b2: d.alignments[0].b2,
        e2: d.alignments[0].e2,
        matches_percent: d.alignments[0].matches_percent,
        ch_match: d.alignments[0].ch_match,
        id: d.alignments[0].id,
      }

      // setting the msPairData will trigger a re-render!
      let versionCode2 = d.id2.split("-")[0];
      setMsPairData({
        book1: {
          versionCode: mainVersionCode,
          b: d.b1,
          e: d.e1,
          ms: d.ms1
        },
        book2: {
          versionCode: versionCode2,
          b: d.b2,
          e: d.e2,
          ms: d.ms2
        },
      })
      setDataLoading({ ...dataLoading, books: true });

      let ms1Text = await getMilestoneText(
        releaseCode, mainVersionCode, d.ms1, downloadedTexts, setDownloadedTexts
      );
      let ms2Text = await getMilestoneText(
        releaseCode, versionCode2, d.ms2, downloadedTexts, setDownloadedTexts
      );

      setDataLoading({ ...dataLoading, books: false });

      let b1Downloaded = downloadedTexts[releaseCode][mainVersionCode]["downloadedMs"];
      let b2Downloaded = downloadedTexts[releaseCode][versionCode2]["downloadedMs"];

      setBooks({
        book1: {
          versionCode: mainVersionCode,
          title: chartData.bookUriDict[mainVersionCode],
          content: b1Downloaded?.msTexts,
          ms: d?.ms1,
          first_ms: null,
          last_ms: null,
        },
        book2: {
          versionCode: versionCode2,
          title: chartData.bookUriDict[versionCode2],
          content: b2Downloaded,
          ms: d?.ms2,
          first_ms: null,
          last_ms: null,
        },      
      })

      // reset the milestones to be displayed in the reader:
      setDisplayMs({ book1: {}, book2: {} });

      // extract the alignment text from the milestone
      // if it is not in the csv data:
      let [s1, startChar1, endChar1] = extractAlignment(
        ms1Text,
        d?.b1,
        d?.e1,
        "char"
      );
      let [s2, startChar2, endChar2] = extractAlignment(
        ms2Text,
        d?.b2,
        d?.e2,
        "char"
      );

      let beforeAlignment1 = ms1Text.slice(0, startChar1);
      let afterAlignment1 = ms1Text.slice(endChar1, ms1Text.length);
      let beforeAlignment2 = ms2Text.slice(0, startChar2);
      let afterAlignment2 = ms2Text.slice(endChar2, ms2Text.length);
      // Earlier: tried to use the character offsets directly, 
      // but that didn't work (includes non-Arabic chars)!
      /*let s1 = ms1Text.slice(d?.b1, d?.e1);
      let s2 = ms2Text.slice(d?.b2, d?.e2);
      let beforeAlignment1 = ms1Text.slice(0, d?.b1);
      let afterAlignment1 = ms1Text.slice(d?.e1, ms1Text.length);
      let beforeAlignment2 = ms2Text.slice(0, d?.b2);
      let afterAlignment2 = ms2Text.slice(d?.e2, ms2Text.length);*/

      setBooksAlignment({
        //s1: d1?.s1,
        //s2: d1?.s2,
        s1: s1,
        s2: s2,
        bw1: null,
        ew1: null,
        bw2: null,
        ew2: null,
        bc1: startChar1,
        ec1: endChar1,
        bc2: startChar2,
        ec2: endChar2,
        beforeAlignment1: beforeAlignment1,
        afterAlignment1: afterAlignment1,
        beforeAlignment2: beforeAlignment2,
        afterAlignment2: afterAlignment2,
      });

      document.getElementById("belowBooks").scrollIntoView({behavior: "smooth", block: "end"});
    };
    //}, [chartData.bookUriDict, dataLoading, downloadedTexts, getMilestoneText, 
    //    mainVersionCode, metaData, releaseCode, setBooks, setBooksAlignment, setDataLoading, setDisplayMs, setMsPairData]);

    const tooltipDiv = d3.select(".vizTooltip");

    const scatterPlot = d3.select(".scatter-plot");
    
    // create X and Y scaling functions:
    let xScale = d3.scaleLinear()
      .domain([0, props.bookStats.length+2])  // each book will have its own space on the X axis
      .range([ 0, width ]); // props.width ]);
    let yScale = d3.scaleLinear()
      .domain([props.mainBookMilestones+1,0])   // flip the axis!
      .range([props.height, 0]);

    // Add X axis:
    scatterPlot
      .selectAll(".xAxis").remove();
    scatterPlot
      .append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + props.height + ")")
        .style("font-size", `${tickFontSize}px`)
        .call(d3.axisBottom(xScale)
          .tickFormat((d) => '')  // remove tick marks in D3 v4: see https://stackoverflow.com/a/12994876/4045481
          .tickSize(0)
        );

    /*// Add X axis label:  see https://stackoverflow.com/a/11194968/4045481
    let xLabelText = "Books for which passim detected text reuse with "+props.mainBookURI+" (chronologically arranged)";
    scatterPlot.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", props.width)
      .attr("y", props.height+20)
      .text(xLabelText);*/

    // Add Y axis:
    scatterPlot
      .selectAll(".yAxis").remove();
    scatterPlot
      .append("g")
        .attr("class", "yAxis")
        .style("font-size", `${tickFontSize}px`)
        .call(d3.axisLeft(yScale)
        .tickSize(2)
        .tickPadding(5)

        // remove zero tick:
        .tickFormat((val,i) => { return val===0 ? null : val})
    );

    // Add Y axis label:
    //d3.select(ref.current)
    scatterPlot
      .selectAll(".yLabel").remove()
    scatterPlot
      .append("text")
        .attr("class", "yLabel")
        .attr("text-anchor", "end")
        .attr("y", tickFontSize)  // replace with axisLabelFontSize
        .attr("dy", "-4em")
        .attr("transform", "rotate(-90)")
        .style("font-size", `${tickFontSize}px`)  // replace with axisLabelFontSize
        .text("Milestones in "+props.mainBookURI);

    if (showDownloadOptions){
      if (includeURL) {
        scatterPlot.append("text")
          .attr("x", props.left)             
          .attr("y", -tickFontSize)  // replace with axisLabelFontSize
          .attr("text-anchor", "left")  
          .style("font-size", `${tickFontSize}px`)  // replace with axisLabelFontSize
          .style("text-decoration", "underline")  
          .text(window.location.origin + url);
      }
    }

    // update the tick font size
    scatterPlot
      .selectAll(`.tick text`).style("font-size", `${tickFontSize}px`);

    // add/update data:
    scatterPlot
      .selectAll("circle")
      .data(props.msdata, d => d)
      .join(
        // create a new <circle> tag for the number of 
        // data points that are not yet in the graph:
        enter => (
          enter
            .append("circle")
              .attr("class", "dot")
              .attr("cx", function (d) { return xScale(d.bookIndex); } )
              .attr("cy", function (d) { return yScale(d.ms1); } )
              .attr("r", props.dotSize)
              .style("fill", function (d) { return colorScale(d.ch_match) } )
              // add tooltip:
              .on("mouseover", function(event, d) { 
                // make the tooltip visible:           
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                // create the text for the tooltip:
                let tooltipMsg = `Milestone ${d.ms1} in ${props.mainBookURI}`;
                if (d.id2 !== versionCode) {
                  tooltipMsg += (d.alignments.length < 2)
                    ? `<br/>Milestone ${d.alignments[0].ms2} in ${props.bookUriDict[d.id2]}`
                    : `<br/>Milestones ${d.alignments.map(el => el.ms2)} in ${props.bookUriDict[d.id2]}`;
                  tooltipMsg += `<br/>Characters matched: ${d.ch_match}`;
                  tooltipMsg += "<br/>(Click dot to compare milestones)"
                }
                // position the tooltip (making sure it does not extend outside view):
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
              .on("click", function(event, d){
                if (d.id2 !== versionCode) {
                  handleClickedDot(event, d);
                }
              })
            .call(enter => enter.transition().duration(100))
        ),
        /*
        // define the transition between reloads:
        update => (
          update
        ),*/
        // remove superfluous circles in the graph:
        exit => (
          exit.call(exit => exit.remove())
        )
      )
  /*}, [props.msdata, props.minChMatch, props.maxChMatch, colorScale, 
      props.bookStats.length, props.bookUriDict, 
      props.dotSize, props.height, props.mainBookMilestones, 
      props.mainBookURI, props.width, versionCode])*/
  });
  
  return (
    <Box 
      id={"chartBox"} 
      sx={{ width: "100%", position: "relative" }}
    >

      <svg 
        id={"scatterChart"}
        ref={ref}
        width={width + props.margin.left + props.margin.right}
        height={props.height + props.margin.top + props.margin.bottom}
      />
      <div ref={bottomOfGraph}/>
    </Box>
  )

};

export default ScatterPlot;
