import { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
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
    releaseCode,
  } = useContext(Context);

  // TODO: let user set width/height (with resizable component or input field?)
  var width = 1000 - visMargins.left - visMargins.right;
  var height = 600 - visMargins.top - visMargins.bottom;

  const book1 = metaData.book1;
  const mainBookURI = book1.bookTitle?.path ?? book1.shelfmark ?? book1.versionCode ?? "";
  const mainAuthor = mainBookURI.split(".")[0];
  const mainAuthorDate = parseInt(mainAuthor.slice(0, 4));

  const downloadFileName = `${book1?.versionCode}_all.png`;

  // extract relevant objects from chartData:
  let {
    versionCode,
    isUpload,
    tokens,
    mainBookMilestones: storedMainBookMilestones,
    msData,
    msStats,
    bookStats,
    bookUriDict,
    maxTotalChMatch
  } = chartData;

  console.log(chartData);

  // Full date range of the loaded dataset (used as slider bounds and for reset):
  let _minDate = Infinity, _maxDate = -Infinity;
  for (const b of chartData.bookStats) {
    if (b.date !== null) {
      if (b.date < _minDate) _minDate = b.date;
      if (b.date > _maxDate) _maxDate = b.date;
    }
  }
  const fullDateRange = isFinite(_minDate) ? [_minDate, _maxDate] : [0, 1500];

  const [dateRange, setDateRange] = useState(fullDateRange);
  const [msRange, setMsRange] = useState([1, storedMainBookMilestones ?? Math.ceil(tokens?.first / 300)]);
  const [uploadDialogBook, setUploadDialogBook] = useState(null);
  const pairwiseUploadRef = useRef(null);
  const handlePairwiseUpload = (files) => {
    setUploadDialogBook(null);
    props.handleUpload(files);
  };
  let maxbc = getHighestValueInArrayOfObjects(bookStats.filter(d => d.id !== versionCode), "ch_match");
  const fullBookCharRange = [1, maxbc];
  const [bookCharRange, setBookCharRange] = useState(fullBookCharRange);
  let maxalign = getHighestValueInArrayOfObjects(bookStats.filter(d => d.id !== versionCode), "alignments");
  const fullAlignRange = [1, maxalign];
  const [bookAlignRange, setBookAlignRange] = useState(fullAlignRange);
  let maxmschars = getHighestValueInArrayOfObjects(msData, "ch_match");
  const [msCharsRange, setMsCharsRange] = useState([1, maxmschars]);

  const [toc, setToc] = useState(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState(null);
  useEffect(() => {
    setSelectedSectionIds(null);
    const vc = metaData?.book1?.versionCode?.split("-")[0];
    if (!vc || !releaseCode) return;
    const url = `https://raw.githubusercontent.com/OpenITI/openiti_toc/refs/heads/v${releaseCode}/tocs/${vc}_TOC.json`;
    let cancelled = false;
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled) setToc(data); })
      .catch(() => { if (!cancelled) setToc(null); });
    return () => { cancelled = true; };
  }, [metaData?.book1?.versionCode, releaseCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // FILTER DATA:
  const hasDates = bookStats.some(d => d.date !== null);
  let dataDateRange = dateRange;
  if (selfReuseOnly) {
    // only keep the items whose author is the same as the author of the main book:
    msData = msData.filter(
      (d) => bookUriDict[d.id2][0].split(".")[0] === mainAuthor
    );
    bookStats = bookStats.filter((d) => (d.book ?? "").split(".")[0] === mainAuthor);
    dataDateRange = isNaN(mainAuthorDate) ? [0, 1500] : [mainAuthorDate, mainAuthorDate + 1];
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
  let [minMs, maxMs] = msRange;

  msData = msData.filter((d) => {
    return (
      (d.id2 === versionCode || d.date === null || (d.date >= minDate && d.date <= maxDate)) &&
      d.ch_match <= maxMsChars &&
      d.ch_match >= minMsChars &&
      d.ms1 >= minMs && d.ms1 <= maxMs
    );
  });
  bookStats = bookStats.filter((d) => {
    return (
      (d.id === versionCode || d.date === null || (d.date >= minDate && d.date <= maxDate)) &&
      (selfReuseOnly && d.book === mainBookURI
        ? 1
        : d.ch_match >= minBookChars) &&
      (selfReuseOnly && d.book === mainBookURI
        ? 1
        : d.ch_match <= maxBookChars) &&
      (d.id === versionCode || (d.alignments >= minAlignments && d.alignments <= maxAlignments))
    );
  });

  // TOC section filter + Y axis zoom:
  let displayMsRange = msRange;
  if (selectedSectionIds && selectedSectionIds.size > 0 && toc) {
    const sectionRanges = Array.from(selectedSectionIds).map(id => {
      const sec = toc.sections[id];
      return [sec.start_ms, sec.end_ms];
    });
    msData = msData.filter(d =>
      sectionRanges.some(([start, end]) => d.ms1 >= start && d.ms1 <= end)
    );
    const minDisplay = Math.max(msRange[0], Math.min(...sectionRanges.map(([s]) => s)));
    const maxDisplay = Math.min(msRange[1], Math.max(...sectionRanges.map(([, e]) => e)));
    if (minDisplay <= maxDisplay) displayMsRange = [minDisplay, maxDisplay];
  }

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

  const mainBookMilestones = storedMainBookMilestones ?? Math.ceil(tokens.first / 300);
  const fullMilestoneRange = [1, mainBookMilestones];

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
                msRange={displayMsRange}
                mainBookURI={mainBookURI}
                versionCode={versionCode}
                isUpload={isUpload}
                bookStats={bookStats}
                maxTotalChMatch={maxTotalChMatch}
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
                msRange={displayMsRange}
                msStats={msStats}
                toc={toc}
                width={100}
                height={height}
                margin={visMargins}
              />
            </div>
          </div>
          <BottomBar
            margin={{ ...visMargins, top: 0 }}
            width={width}
            height={120}
            bookStats={bookStats}
            mainBookURI={mainBookURI}
            dateRange={dataDateRange}
            isUpload={isUpload}
            hasDates={hasDates}
            onUploadRequest={(d) => setUploadDialogBook(d)}
          />
          <Dialog
            open={uploadDialogBook !== null}
            onClose={() => setUploadDialogBook(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Upload pairwise TSV file</DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2 }}>
                Please upload the pairwise TSV file for{" "}
                <strong>{uploadDialogBook?.book ?? uploadDialogBook?.id}</strong>:
              </Typography>
              <Typography
                sx={{ mb: 2, fontFamily: "monospace", wordBreak: "break-all" }}
              >
                {versionCode}_{uploadDialogBook?.id}.csv
              </Typography>
              <Box
                sx={{
                  border: "2px dashed grey",
                  borderRadius: "8px",
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#2862a5", color: "#2862a5" },
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePairwiseUpload(e.dataTransfer.files);
                }}
                onClick={() => pairwiseUploadRef.current?.click()}
              >
                <i
                  className="fa-solid fa-cloud-arrow-up"
                  style={{ fontSize: "2em", display: "block", marginBottom: "8px" }}
                />
                <Typography>Drag &amp; drop a TSV file here, or click to browse</Typography>
                <input
                  ref={pairwiseUploadRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => handlePairwiseUpload(e.target.files)}
                />
              </Box>
            </DialogContent>
          </Dialog>
        </>
        <div className={"vizTooltip"} sx={{ style: "opacity: 0" }} />
      </Box>
      <MultiFilter
        hasDates={hasDates}
        fullDateRange={fullDateRange}
        setDateRange={setDateRange}
        fullMilestoneRange={fullMilestoneRange}
        setMsRange={setMsRange}
        fullBookCharRange={fullBookCharRange}
        setBookCharRange={setBookCharRange}
        fullAlignRange={fullAlignRange}
        setBookAlignRange={setBookAlignRange}
        msCharsRange={msCharsRange}
        setMsCharsRange={setMsCharsRange}
        toc={toc}
        selectedSectionIds={selectedSectionIds}
        setSelectedSectionIds={setSelectedSectionIds}
      />
    </Box>
  );
};

export default MultiVisual;
