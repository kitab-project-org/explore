import { useContext, useState } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";
import ScatterPlot from "./ScatterPlot";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import MultiFilter from "./MultiFilter";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import VisualizationHeader from "../SectionHeader/VisualizationHeader";
import { getHighestValueInArrayOfObjects } from "../../../utility/Helper";
import { Context } from "../../../App";


const MultiVisual = (props) => {
  console.log("RENDERING MULTI CHART");

  const {
    metaData,
    chartData,
    setXScale,
    setYScale,
    colorScale,
    selfReuseOnly,
    visMargins,
    //setChartData,
    /*Books,
    setBooks,
    bookSectionRef,
    focusMilestone1,
    focusMilestone2,
    setBooksAlignment,
    isFlipped,
    dataLoading,
    setDataLoading,
    setFocusedDataIndex,
    setDisplayMs,
    focusedDataIndex,
    setFlipTimeLoading,*/
    //colors,
    //setColors
  } = useContext(Context);

  // TODO: let user set width/height (with resizable component or input field?)
  var width = 1000 - visMargins.left - visMargins.right;
  var height = 600 - visMargins.top - visMargins.bottom;

  const book1 = metaData.book1;
  const mainBookURI = book1.bookTitle.path;
  const mainAuthor = mainBookURI.split(".")[0];
  const mainAuthorDate = parseInt(mainAuthor.slice(0, 4));

  const downloadFileName = `${book1?.versionCode}_all.png`;

  /*const infernoReversed = [
    "#fcffa4",
    "#f7d13d",
    "#fb9b06",
    "#ed6925",
    "#cf4446",
    "#a52c60",
    "#781c6d",
    "#4a0c6b",
    "#1b0c41",
    "#000004"
  ];*/

  // extract relevant objects from chartData:
  let {
    versionCode,
    tokens,
    msData,
    msStats,
    //msBooks,
    bookStats,
    //bookIndexDict,
    bookUriDict,
  } = chartData;
  /*console.log("CHARTDATA:");
  console.log(chartData);
  console.log(bookStats);*/
  
  const [dateRange, setDateRange] = useState([0, 1500]);
  let maxbc = getHighestValueInArrayOfObjects(bookStats, "ch_match");
  const [bookCharRange, setBookCharRange] = useState([1, maxbc]);
  let maxalign = getHighestValueInArrayOfObjects(bookStats, "alignments");
  const [bookAlignRange, setBookAlignRange] = useState([1, maxalign]);
  let maxmschars = getHighestValueInArrayOfObjects(msData, "ch_match");
  const [msCharsRange, setMsCharsRange] = useState([1, maxmschars]);

  // FILTER DATA:
  let dataDateRange = dateRange;
  if (selfReuseOnly) {
    // only keep the items whose author is the same as the author of the main book:
    msData = msData.filter(
      (d) => bookUriDict[d.id2][0].split(".")[0] === mainAuthor
    );
    bookStats = bookStats.filter((d) => d.book.split(".")[0] === mainAuthor);
    dataDateRange = [mainAuthorDate, mainAuthorDate + 1];
  }
  /*console.log("AFTER SELFREUSE FILTER:");
  console.log(msData);
  console.log(bookStats);
  console.log(msStats);*/

  // filter by date:
  let [minDate, maxDate] = dateRange;
  let [minBookChars, maxBookChars] = bookCharRange;
  let [minAlignments, maxAlignments] = bookAlignRange;
  let [minMsChars, maxMsChars] = msCharsRange;

  msData = msData.filter((d) => {
    return (
      d.date >= minDate &&
      d.date <= maxDate &&
      d.ch_match <= maxMsChars &&
      d.ch_match >= minMsChars
    );
  });
  bookStats = bookStats.filter((d) => {
    return (
      d.date >= minDate &&
      d.date <= maxDate &&
      (selfReuseOnly && d.book === mainBookURI
        ? 1
        : d.ch_match >= minBookChars) &&
      (selfReuseOnly && d.book === mainBookURI
        ? 1
        : d.ch_match <= maxBookChars) &&
      d.alignments >= minAlignments &&
      d.alignments <= maxAlignments
    );
  });

  // recalculate the index numbers (X values):
  let bookIndexDict = {}; // keys: versionID, values: bookIndex
  bookUriDict = {}; // keys: versionID, values: textURI
  for (let i = 0; i < bookStats.length; i++) {
    bookStats[i]["bookIndex"] = i + 1;
    bookIndexDict[bookStats[i]["id"]] = i + 1;
    bookUriDict[bookStats[i]["id"]] = [bookStats[i]["book"]];
  }
  for (let i = 0; i < msData.length; i++) {
    try {
      msData[i]["bookIndex"] = bookIndexDict[msData[i]["id2"]];
    } catch (error) {}
  }

  // recalculate msStats:
  msStats = {};
  //msBooks = {};
  for (let i = 0; i < msData.length; i++) {
    if (msData[i]["id2"] !== versionCode) {
      // add the length of the alignment in book 2 to the aggregator for ms1:
      msStats[msData[i]["ms1"]] =
        (msStats[msData[i]["ms1"]] || 0) + msData[i]["ch_match"];
      // count the number of books that have text reuse for ms1:
      //msBooks[msData[i]["ms1"]] = (msBooks[msData[i]["ms1"]] || 0) + 1;
    }
  }
  // convert msStats Object into an array of objects:
  msStats = Object.keys(msStats).map((key) => ({
    ms_id: parseInt(key),
    ch_match_total: msStats[key],
  }));

  /*console.log("AFTER OTHER FILTERS:");
  console.log(msData);
  console.log(bookStats);
  console.log(msStats);*/

  const restoreCanvas = () => {
    // reload without filter search params
    //setSearchParams((prev) => ({books: prev.books}))
    console.log("TO DO: restore canvas");
  };

  const mainBookMilestones = Math.ceil(tokens.first / 300);

  // build variables needed to create axes:
  /*const maxChMatch = msData.reduce(
    (a,b) => a.ch_match > b.ch_match ? a : b
    ).ch_match;
  const minChMatch = msData.reduce(
    (a,b) => a.ch_match < b.ch_match ? a : b
    ).ch_match;*/
  const [minChMatch, maxChMatch] = d3.extent(msData, (d) => d.ch_match);

  let dotSize = Math.min(
    Math.ceil(width / bookStats.length / 2),
    Math.ceil(height / mainBookMilestones / 2),
    5
  );

  const [toggle, setToggle] = useState(false);

  return (
    <Box sx={{ mt: "40px" }}>
      <SectionHeaderLayout
        item={{
          title: "One-to-Many Visualization",
          icon: "fa-solid fa-chart-column",
        }}
        toggle={toggle}
        setToggle={setToggle}
      >
        <VisualizationHeader
          restoreCanvas={restoreCanvas}
          isPairwiseViz={props.isPairwiseViz}
          downloadFileName={downloadFileName}
          colorScale={colorScale}
          width={width}
        />
      </SectionHeaderLayout>

      <Box
        id="multiVis"
        sx={{
          px: {
            position: "relative",
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
                mainBookURI={mainBookURI}
                versionCode={versionCode}
                bookStats={bookStats}
                msdata={msData}
                maxChMatch={maxChMatch}
                minChMatch={minChMatch}
                margin={visMargins}
                width={width}
                height={height}
                dotSize={dotSize}
                bookUriDict={bookUriDict}
                setXScale={setXScale}
                setYScale={setYScale}
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
                msStats={msStats}
                width={100}
                height={height}
                margin={visMargins}
              />
            </div>
          </div>
          <BottomBar
            margin={{ ...visMargins, top: 0 }}
            width={width}
            height={100}
            bookStats={bookStats}
            mainBookURI={mainBookURI}
            dateRange={dataDateRange}
          />
        </>
        <div className={"vizTooltip"} sx={{ style: "opacity: 0" }} />
      </Box>
      <MultiFilter
        dateRange={dateRange}
        setDateRange={setDateRange}
        bookCharRange={bookCharRange}
        setBookCharRange={setBookCharRange}
        bookAlignRange={bookAlignRange}
        setBookAlignRange={setBookAlignRange}
        msCharsRange={msCharsRange}
        setMsCharsRange={setMsCharsRange}
      />
    </Box>
  );
};

export default MultiVisual;
