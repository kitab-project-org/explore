import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../App";
import * as d3 from "d3";
import MSToggler from "../SectionHeader/MSToggler";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import VisualizationHeader from "../SectionHeader/VisualizationHeader";
import { extractAlignment } from "../../../functions/alignmentFunctions";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import Section from "../Metadata/Section";
import { getHighestValueInArrayOfObjects } from "../../../utility/Helper";


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
  } = useContext(Context);

  const [toggle, setToggle] = useState(false);

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

  var clipPathId = "clipDrawing";
  var clipPath = "url('#clipDrawing')";

  var chartBox,
    svgD3,
    drawingG,
    marksG,
    clipRect,
    x0ScaleNode,
    x1ScaleNode,
    outerHeight = 530,
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

  var margin = {
      top: 40,
      right: 20,
      bottom: 20,
      left: 60,
    },
    padding = {
      top: 40,
      right: 0,
      bottom: 40,
      left: 40,
    };

  var book1Bars, connections, book2Bars, brushG;
  var xScale, xScaleIdentity, x0Axis, x1Axis;
  var y0Scale, y0Axis, y1Scale, y1Axis;
  var brushHandle = d3.brushX().on("end", brushEnded);

  var xIdentityDomain,
    currentXDomain,
    duration1 = 700;

  let lastMsFirst = Math.ceil(chartData?.tokens?.first / chunkSize);
  let lastMsSecond = Math.ceil(chartData?.tokens?.second / chunkSize);
  // if the number of tokens is not found from the metadata, 
  // use the last milestone for which reuse was found as a proxy
  let showBookEnd1 = true;
  let showBookEnd2 = true;
  if (lastMsFirst === 0) {
    console.log(chartData);
    lastMsFirst = getHighestValueInArrayOfObjects(chartData.dataSets, "seq1");
    showBookEnd1 = false;
  }
  if (lastMsSecond === 0) {
    lastMsSecond = getHighestValueInArrayOfObjects(chartData.dataSets, "seq2");
    showBookEnd2 = false;
  }
  console.log(`showBookEnd1: ${showBookEnd1}, showBookEnd2: ${showBookEnd2}`);


  var maxValues = {
    book1: isFlipped ? lastMsSecond : lastMsFirst, //13000,
    book2: isFlipped ? lastMsFirst : lastMsSecond, //13500,
    peak: Math.max(lastMsFirst, lastMsSecond), //13871,
  };

  /////////////// CHART HELPER FUNCTIONS: DRAWING ////////////////////

  function createChart() {
    chartBox = document.getElementById("chartBox");
    svgD3 = d3.select(document.getElementById("svgChart"));
    svgD3.selectAll("*").remove();
    svgD3.attr("class", "chartGroup");

    brushG = svgD3.append("g").attr("class", "brush");
    drawingG = svgD3
      .append("g")
      .attr("class", "drawing")
      .attr("clip-path", clipPath);
    marksG = svgD3.append("g").attr("class", "markings");

    book1Bars = drawingG.append("g").attr("id", "firstchart");
    connections = drawingG.append("g").attr("class", "connections");
    book2Bars = drawingG.append("g").attr("id", "secondchart");

    xScale = d3.scaleLinear();
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
    innerWidth = outerWidth - margin.left - margin.right;
    innerHeight = outerHeight - margin.top - margin.bottom;
    width = innerWidth - padding.left - padding.right;
    height = innerHeight - 20;

    svgD3.attr("width", outerWidth - 30).attr("height", outerHeight);

    drawingG.attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")"
    );
    brushG.attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")"
    );
    marksG.attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")"
    );
    book2Bars.attr("transform", "translate(0,300)");

    clipRect.attr("width", width).attr("height", height);
    // --- Set Scales on Basis of the chartData ::

    max = maxValues;
    xIdentityDomain = [0, max.peak];
    currentXDomain || (currentXDomain = xIdentityDomain);
    xScale.domain(currentXDomain).range([1, width - 1]);
    xScaleIdentity.domain(xIdentityDomain).range([1, width - 1]);
    x0Axis = d3.axisBottom(xScale);
    x1Axis = d3.axisTop(xScale).tickValues([1, max.book2]);
    brushHandle.extent([
      [0, 0],
      [width, height],
    ]);
    refLinesData = [
      { x: 1, y: 0, yScale: y0Scale, solid: true },
      { x: max.book1, y: 0, yScale: y0Scale, solid: showBookEnd1 },
      { x: 1, y: barMaxHeight * 2, yScale: y1Scale, solid: true },
      { x: max.book2, y: barMaxHeight * 2, yScale: y1Scale, solid: showBookEnd2  },
    ];

    hoverLines = [
      { x: barMaxHeight, y: 0, yScale: y0Scale, visible: false },
      { x: barMaxHeight, y: barMaxHeight * 2, yScale: y0Scale, visible: false },
    ];
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

    // - Append Brush
    brushG.call(brushHandle).select(".overlay");

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
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("x1", function (d) {
        return xScale(Number(d.seq1));
      })
      .attr("x2", function (d) {
        return xScale(Number(d.seq1));
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
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("d", function (d) {
        return (
          "M " +
          xScale(Number(d.seq1)) +
          " 150 C " +
          xScale(Number(d.seq1)) +
          " 250," +
          xScale(Number(d.seq2)) +
          " 220 , " +
          xScale(Number(d.seq2)) +
          " " +
          300
        );
      });

    // - render Bars of Book2 ::
    book2Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("x1", function (d) {
        return xScale(Number(d.seq2));
      })
      .attr("x2", function (d) {
        return xScale(Number(d.seq2));
      })
      .attr("y1", function (d) {
        return y1Scale(Number(d.bw2));
      })
      .attr("y2", function (d) {
        return y1Scale(Number(d.ew2));
      });

    // - render X Axis of Book1 ::
    x0Axis.tickValues(
      selectedLine ? [1, Number(selectedLine.seq1), max.book1] : [1, max.book1]
    );
    x0ScaleNode
      .transition(t)
      .call(x0Axis)
      .selectAll("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    // - render X Axis of Book2 ::
    x1Axis.tickValues(
      selectedLine ? [1, Number(selectedLine.seq2), max.book2] : [1, max.book2]
    );
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
        return xScale(d.x);
      })
      .attr("x2", function (d) {
        return xScale(d.x);
      })
      .attr("y1", function (d) {
        return d.yScale(0) + d.y;
      })
      .attr("y2", function (d) {
        return d.yScale(chunkSize) + d.y;
      });

    return t;
  }

  function flipChart(duration) {
    var t = svgD3.transition().duration(duration || 0);

    // - render Bars of Book1 and Book2 ::
    book1Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("x1", function (d) {
        return xScale(Number(d.seq2));
      })
      .attr("x2", function (d) {
        return xScale(Number(d.seq2));
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
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("d", function (d) {
        return (
          "M " +
          xScale(Number(d.seq2)) +
          " 150 C " +
          xScale(Number(d.seq2)) +
          " 250," +
          xScale(Number(d.seq1)) +
          " 220 , " +
          xScale(Number(d.seq1)) +
          " " +
          chunkSize
        );
      });

    // - render Bars of Book2 ::
    book2Bars
      .selectAll(".bar")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", selectLineOnClicked)
      .transition(t)
      .attr("x1", function (d) {
        return xScale(Number(d.seq1));
      })
      .attr("x2", function (d) {
        return xScale(Number(d.seq1));
      })
      .attr("y1", function (d) {
        return y1Scale(Number(d.bw1));
      })
      .attr("y2", function (d) {
        return y1Scale(Number(d.ew1));
      });

    // - render X Axis of Book1 ::
    x0Axis.tickValues(
      selectedLine
        ? [
            1,
            Number(isFlipped ? selectedLine.seq2 : selectedLine.seq1),
            max.book1,
          ]
        : [1, max.book1]
    );
    x0ScaleNode
      .transition(t)
      .call(x0Axis)
      .selectAll("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    // - render X Axis of Book2 ::
    x1Axis.tickValues(
      selectedLine
        ? [
            1,
            Number(isFlipped ? selectedLine.seq1 : selectedLine.seq2),
            max.book2,
          ]
        : [1, max.book2]
    );
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
        return xScale(d.x);
      })
      .attr("x2", function (d) {
        return xScale(d.x);
      })
      .attr("y1", function (d) {
        return d.yScale(0) + d.y;
      })
      .attr("y2", function (d) {
        return d.yScale(chunkSize) + d.y;
      });

    return t;
  }

  /////////////// CHART HELPER FUNCTIONS: INTERACTIONS ////////////////////

  function brushEnded(e) {
    if (!e.sourceEvent) return; // Only transition after input.
    var sel = e.selection;
    if (!sel) {
      return;
    }

    currentXDomain = sel.map(function (d) {
      return Math.round(xScale.invert(d));
    });
    xScale.domain(currentXDomain);
    zoom();
  }

  function restoreCanvas() {
    if (selectedLine) {
      selectedLine = null;
    }
    setFocusedDataIndex(null);
    normalChart();
    setTimeout(zoom, 0);
  }

  function zoom() {
    brushG.call(brushHandle.move, null);
    isFlipped ? flipChart(duration1) : updateChart(duration1);
  }

  function focusOnLine(d1) {
    var a = Number(d1.seq1);
    var b = Number(d1.seq2);
    var min = Math.min(a, b) - xScaleIdentity.invert(5);
    var max = Math.max(a, b) + xScaleIdentity.invert(5);

    currentXDomain = [min, max];

    xScale.domain(currentXDomain);
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
    // set data to tooltip
    if (e) {
      setToolTip({
        isActive: true,
        layerX: e.layerX,
        layerY: e.layerY,
        data: {
          book1: {
            ms: d1?.seq1,
            pos1: d1?.bw1,
            pos2: d1?.ew1,
          },
          book2: {
            ms: d1?.seq2,
            pos1: d1?.bw2,
            pos2: d1?.ew2,
          },
        },
      });
    } else {
      normalChart();
    }

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
        return xScale(d.x);
      })
      .attr("x2", function (d) {
        return xScale(d.x);
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
    // clear data from tooltip
    setToolTip({
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
    //console.log(d1);
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

    setBooksAlignment({
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
    });

    if (d1 === selectedLine) return;

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

    // scroll to the diff viewer:
    document.getElementById("belowBooks").scrollIntoView();
  }

  function clearSelectedLine() {
    var d2 = selectedLine;
    selectedLine = null;
    d2.hidden = true;
    mouseOut(d2);
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
  };

  /////////////////////////////////////////////////////////////////////

  useEffect(() => {
    normalChart();
    if (focusedDataIndex) {
      mouseOver(null, chartData?.dataSets[focusedDataIndex]);
      selectLineOnClicked(null, chartData?.dataSets[focusedDataIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped]);

  return (
    <>
      <SectionHeaderLayout
        item={{
          title: "Pairwise Visualization",
          icon: "fa-solid fa-chart-column",
        }}
        toggle={toggle}
        setToggle={setToggle}
      >
        <VisualizationHeader
          restoreCanvas={restoreCanvas}
          isPairwiseViz={props.isPairwiseViz}
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt="20px"
        >
          <Section
            isVertical
            data={isFlipped ? metaData?.book2 : metaData?.book1}
          />
          <MSToggler
            isTop={isFlipped ? false : true}
            isBook1={isFlipped ? false : true}
            selectLineOnClicked={selectLineOnClicked}
            mouseOver={mouseOver}
          />
        </Box>
        <Box id={"chartBox"} sx={{ width: "100%", position: "relative" }}>
          <svg
            id={"svgChart"}
            style={{ position: "relative", background: "white" }}
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
            </Box>
          )}
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Section
            isVertical
            data={isFlipped ? metaData?.book1 : metaData?.book2}
          />
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
