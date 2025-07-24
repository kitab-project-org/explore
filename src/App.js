import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, red } from "@mui/material/colors";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Insight from "./pages/Insight";
import Visualisation from "./pages/Visualisation";
import CorpusMetadata from "./pages/CorpusMetadata";
import { createContext, useRef, useState } from "react";
import DiffViewer from "./pages/DiffViewer";
import LeftSidePanel from "./components/CorpusMetadata/Drawer";
import * as saveSvgAsPng from "save-svg-as-png";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2863A5",
    },
    secondary: {
      main: green[500],
    },
    neutral: {
      main: "#7593af",
      contrastText: "#fff",
    },
    iconColor: {
      main: "#fff",
    },
    mARkdown: {
      main: green[500],
    },
    notYetAnnotated: {
      main: red[500],
    },
    inProgress: {
      main: "#2863A5",
    },
    completed: {
      main: "#ed6c02",
    },
    deactivateColor: {
      main: "#d3d3d3",
    },
    pri: {
      main: "#fdeded",
    },
    invisible: {
      main: "#fff",
    },
    mainNav: {
      main: "#eee",
    },
  },
  typography: {
    fontFamily: [
      "Amiri",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

export const Context = createContext();

function App() {
  // ===== State - Metatable States =====
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [defaultReleaseCode, setDefaultReleaseCode] = useState("2023.1.8");
  const [releaseCode, setReleaseCode] = useState(defaultReleaseCode);
  const [status, setStatus] = useState(false);
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState("");
  const [normalizedSearch, setNormalizedSearch] = useState(true);
  const [sortingOrder, setOrderingOrder] = useState("");
  const [analysisPriority, setAnalysisPriority] = useState(false);
  const [annotationFilter, setAnnotationFilter] = useState({
    completed: false,
    inProgress: false,
    mARkdown: false,
    notYetAnnotated: false,
  });
  const [advanceSearchModal, setAdvanceSearchModal] = useState(false);
  const [releaseCodeChanged, setReleaseCodeChanged] = useState(false);

  const [totalRecords, setTotal] = useState(0);

  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [versionDetail, setVersionDetails] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  const [checkedBooks, setCheckedBooks] = useState([]);
  const [checkedNotification, setCheckedNotification] = useState("");
  const [showFilters, setFilterPanel] = useState(false);

  const [metaData, setMetaData] = useState({});
  const [chartData, setChartData] = useState({
    tokens: {
      first: "",
      second: "",
    },
    dataSets: [],
  });
  // will keep the csv file object in memory:
  const [loadedCsvFile, setLoadedCsvFile] = useState(null);
  // will hold downloaded sections for book1 and book2:
  const [books, setBooks] = useState();
  // control spinners (true => keep spinning):
  const [dataLoading, setDataLoading] = useState({
    uploading: false, // uploading csv file
    metadata: false, // downloading metadata from API
    chart: false, // drawing chart
    books: false, // downloading milestones from GitHub
    alignments: false, // not used?
  });

  // Advance Search States
  const [advanceSearch, setAdvanceSearch] = useState({
    // max_char_count: "",
    // min_char_count: "",
    max_tok_count: "",
    min_tok_count: "",
    editor: "",
    edition_place: "",
    publisher: "",
    edition_date: "",
    died_before_AH: "",
    died_after_AH: "",
  });

  // ===== Visualization Page's State =====

  const bookSectionRef = useRef();
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [showTickSizeInput, setShowTickSizeInput] = useState(false);
  const [tickFontSize, setTickFontSize] = useState(12);
  const [outputImageWidth, setOutputImageWidth] = useState(120);
  const [dpi, setDpi] = useState(300);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipTimeLoading, setFlipTimeLoading] = useState(false);
  const focusMilestone1 = useRef();
  const focusMilestone2 = useRef();
  const [chartSpecificBar, setChartSpecificBar] = useState({});
  // contains alignment string and start+end indices of alignment:
  const [booksAlignment, setBooksAlignment] = useState({
    // alignment strings:
    s1: "",
    s2: "",
    // part of the milestones before the alignment:
    beforeAlignment1: "",
    beforeAlignment2: "",
    // part of the milestones after the alignment:
    afterAlignment1: "",
    afterAlignment2: "",
    // token (*w*ord) offset of *b*eginning and *e*nd of the alignment:
    bw1: 0,
    ew1: 0,
    bw2: 0,
    ew2: 0,
    // *c*haracter offset of *b*eginning and *e*nd of the alignment:
    bc1: 0,
    ec1: 0,
    bc2: 0,
    ec2: 0,
  });
  const [focusedDataIndex, setFocusedDataIndex] = useState(null);
  const [bookIntoRows, setBookIntoRows] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});
  const [showWikiEdDiff, setWikiEdDiff] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [includeURL, setIncludeURL] = useState(true);
  const [url, setUrl] = useState("");
  const [highlightMode, setHighlightMode] = useState("diff");
  const [nSharedChars, setNSharedChars] = useState(50);
  const [nRefineChars, setNRefineChars] = useState(3);
  // milestones (to be/currently) displayed in the books/diff section:
  const [displayMs, setDisplayMs] = useState({
    book1: {},
    book2: {},
  });

  // use a yellow-orange-red colorscale, and add black only for the main book:
  const YlOrRd = [
    "#ffffcc",
    "#fff0a9",
    "#fee087",
    "#fec965",
    "#feab4b",
    "#fd893c",
    "#fa5c2e",
    "#ec3023",
    "#d31121",
    "#af0225",
  ];
  const [colors, setColors] = useState(YlOrRd.concat(["#000004"]));
  const [colorScale, setColorScale] = useState(() => () => 1); // dummy function

  const [msData, setMsData] = useState({});
  const [bookStats, setBookStats] = useState({});
  const [xScale, setXScale] = useState(
    (x) =>
      function (x) {
        return x;
      }
  );
  const [yScale, setYScale] = useState(
    (y) =>
      function (y) {
        return y;
      }
  );
  const [mainVersionCode, setMainVersionCode] = useState(null);
  const [msPairData, setMsPairData] = useState(null);
  const [downloadedTexts, setDownloadedTexts] = useState({});

  // diff text options
  const [normalizeAlif, setNormalizeAlif] = useState(true);
  const [normalizeYa, setNormalizeYa] = useState(true);
  const [normalizeHa, setNormalizeHa] = useState(true);
  const [removePunct, setRemovePunct] = useState(false);
  const [removeTags, setRemoveTags] = useState(true);

  const [selfReuseOnly, setSelfReuseOnly] = useState(false);

  const toggleSidePanel = (val, tIndex) => {
    setTabIndex(tIndex);
    setVersionDetails(val);
    setIsOpenDrawer(true);
  };

  const downloadPNG = (downloadFileName, svgId, includeURL=false) => {
    //const downloadFileName = `${metaData?.book1?.versionCode}_${metaData?.book2?.versionCode}.png`;
    const svg = document.getElementById(svgId);
    const newSvg = svg.cloneNode(true);

    if (includeURL) {
      // create a text element in the svg that shows the URL:
      var textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      textElement.setAttribute(
        "x",
        svg.clientWidth - (window.location.origin + url).length * 7.5
      ); // X-coordinate
      textElement.setAttribute("y", 20); // Y-coordinate
      textElement.setAttribute("font-size", "14px"); // Font size
      textElement.setAttribute("fill", "black"); // Fill color
      // Create a text node with the URL
      var textNode = document.createTextNode(window.location.origin + url);
      // Append the text node to the <text> element
      textElement.appendChild(textNode);
      // Append the <text> element to the SVG
      newSvg.appendChild(textElement);
    }

    // save the png:
    saveSvgAsPng.saveSvgAsPng(newSvg, downloadFileName, {
      // TODO: set the scale based on the output size and dpi values:
      scale: 3, // 300 % 
      backgroundColor: "white",
    });
  };

  return (
    <Context.Provider
      value={{
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        rows,
        setRows,
        defaultReleaseCode,
        setDefaultReleaseCode,
        releaseCode,
        setReleaseCode,
        status,
        setStatus,
        query,
        setQuery,
        searchField,
        setSearchField,
        advanceSearchModal,
        setAdvanceSearchModal,
        normalizedSearch,
        setNormalizedSearch,
        sortingOrder,
        setOrderingOrder,
        analysisPriority,
        setAnalysisPriority,
        annotationFilter,
        setAnnotationFilter,
        totalRecords,
        setTotal,
        releaseCodeChanged,
        setReleaseCodeChanged,
        versionDetail,
        setVersionDetails,
        tabIndex,
        setTabIndex,
        checkedBooks,
        setCheckedBooks,
        checkedNotification,
        setCheckedNotification,
        showFilters,
        setFilterPanel,
        metaData,
        setMetaData,
        chartData,
        setChartData,
        loadedCsvFile,
        setLoadedCsvFile,
        books,
        setBooks,
        dataLoading,
        setDataLoading,
        bookSectionRef,
        showTickSizeInput, 
        setShowTickSizeInput,
        tickFontSize, 
        setTickFontSize,
        outputImageWidth,
        setOutputImageWidth,
        dpi, 
        setDpi,
        isFlipped,
        setIsFlipped,
        flipTimeLoading,
        setFlipTimeLoading,
        focusMilestone1,
        focusMilestone2,
        chartSpecificBar,
        setChartSpecificBar,
        booksAlignment,
        setBooksAlignment,
        selectedLine,
        setSelectedLine,
        showWikiEdDiff,
        setWikiEdDiff,
        isOpenDrawer,
        setIsOpenDrawer,
        toggleSidePanel,
        isFileUploaded,
        setIsFileUploaded,
        bookIntoRows,
        setBookIntoRows,
        focusedDataIndex,
        setFocusedDataIndex,
        isError,
        setIsError,
        showOptions,
        setShowOptions,
        showDownloadOptions, 
        setShowDownloadOptions,
        includeURL, 
        setIncludeURL,
        url,
        setUrl,
        highlightMode,
        setHighlightMode,
        nSharedChars,
        setNSharedChars,
        nRefineChars,
        setNRefineChars,
        displayMs,
        setDisplayMs,
        colors,
        setColors,
        colorScale,
        setColorScale,
        msData,
        setMsData,
        bookStats,
        setBookStats,
        xScale,
        setXScale,
        yScale,
        setYScale,
        mainVersionCode,
        setMainVersionCode,
        msPairData,
        setMsPairData,
        downloadedTexts,
        setDownloadedTexts,
        normalizeAlif,
        setNormalizeAlif,
        normalizeYa,
        setNormalizeYa,
        normalizeHa,
        setNormalizeHa,
        removePunct,
        setRemovePunct,
        removeTags,
        setRemoveTags,
        selfReuseOnly,
        setSelfReuseOnly,
        downloadPNG,
        advanceSearch,
        setAdvanceSearch,
      }}
    >
      <ThemeProvider theme={theme}>
        <div className="App">
          <Router basename="/">
            <Routes>
              <Route path="" element={<CorpusMetadata isHome />} />
              <Route path="/:version" element={<CorpusMetadata isHome />} />
              <Route path="/metadata/" element={<CorpusMetadata />} />
              <Route path="/metadata/:version/" element={<CorpusMetadata />} />
              <Route path="/insight" element={<Insight />} />
              <Route path="/visualise/" element={<Visualisation />} />
              <Route path="/visualise/:version" element={<Visualisation />} />
              <Route path="/diffViewer" element={<DiffViewer />} />
            </Routes>
            <LeftSidePanel />
          </Router>
        </div>
      </ThemeProvider>
    </Context.Provider>
  );
}

export default App;
