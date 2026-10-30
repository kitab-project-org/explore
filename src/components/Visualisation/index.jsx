import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Header from "./Header";
import UploadInput from "./UploadInput";
import Visual from "./Chart";
import MultiVisual from "./MultiChart";
import Books from "./Books";
import CircularInterminate from "./CircularIndeterminate";
import LoaderIcon from "../Common/LoaderIcon";
import { getMetadataObject } from "../../functions/getMetadataObject";
import { setInitialValues } from "../../functions/setInitialValues";
import { getVersionMeta } from "../../functions/getVersionMeta";
import { setPairwiseVizData, setMultiVizData } from "../../functions/setVisualizationData";
import { downloadCsvData, getOneBookReuseStats, getOneBookMsData } from "../../services/TextReuseData";
import { getMetaLabel, measureSvgText, wrapTextToSvgWidth, checkPairwiseCsvResponse } from "../../utility/Helper";
// import { lightSrtFolders, srtFoldersGitHub } from "../../assets/srtFolders";
import { Context } from "../../App";
import PairwiseVisualizationTour, { DEMO_BOOKS } from "../GuidedTour/PairwiseVisualizationTour";
import CorpuswideVisualizationTour, { DEMO_BOOKS as CORPUSWIDE_DEMO_BOOKS } from "../GuidedTour/CorpuswideVisualizationTour";
import { MAIN_TOUR_REQUEST } from "../GuidedTour/TourMenu";


// Check the metadata response from a URL - return an array of failed books
const checkVersionMeta = (versionMeta, bookNames) => {
  const failedBooks = [];
  for (const [key, value] of Object.entries(versionMeta)) {
    if (value instanceof Error || value?.message?.includes("Unexpected token")) {
      const failedIndex = key.replace("book", "") - 1;
      let failedBook = bookNames[failedIndex];
      failedBooks.push(failedBook);
    }
  }
  return failedBooks;
}

// construct the text reuse csv filename based on metadata of both books:
const buildCsvFilename = (book1Meta, book2Meta) => {
  let parts = [];
  for (const bookMeta of [book1Meta, book2Meta]) {
    // build part of the filename (version ID + lang + extension):
    let part = bookMeta.release_version.url
      .split("/")
      .slice(-1)[0] // take the last part of the URL
      .split(".")
      .slice(2)
      .join("."); // remove the book URI
    parts.push(part);
  }
  return parts.join("_") + ".csv";
};

const buildPlaceholderMeta = (bookID) => {
  return {
    "id": 0,
    "version_code": bookID ? bookID : "NOT FOUND",
    "version_uri": bookID ? bookID : "NOT FOUND",
    "language": "undefined",
    "text": {
        "text_uri": bookID ? bookID : "NOT FOUND",
        "title_ar_prefered": "NOT_FOUND",
        "title_lat_prefered": "NOT_FOUND",
        "titles_ar": "NOT_FOUND",
        "titles_lat": "NOT_FOUND",
        "tags": "NOT_FOUND",
        "author": [
            {
                "id": 0,
                "author_uri": "NOT_FOUND",
                "author_ar": "NOT_FOUND",
                "author_ar_prefered": "NOT_FOUND",
                "author_lat": "NOT_FOUND",
                "author_lat_prefered": "NOT_FOUND",
                "name_elements": [],
                "date": 0,
                "date_AH": 0,
                "date_CE": 0,
                "date_str": "NOT_FOUND",
                "tags": "NOT_FOUND",
                "bibliography": "NOT_FOUND",
                "notes": "NOT_FOUND",
                "related_persons": [],
                "related_texts": [],
                "related_places": []
            }
        ],
        "bibliography": "NOT_FOUND",
        "related_persons": [],
        "related_texts": [],
        "related_places": []
    },
    "edition": {
        "id": 0,
        "editor": "NOT_FOUND",
        "edition_place": "NOT_FOUND",
        "publisher": "NOT_FOUND",
        "edition_date": "NOT_FOUND",
        "ed_info": "NOT_FOUND",
        "pdf_url": "NOT_FOUND",
        "worldcat_url": "NOT_FOUND"
    },
    "part_of": null,
    "github_issues": [],
    "release_version": {
      "release_code": "NOT_FOUND",
      "release_date": "NOT_FOUND",
      "zenodo_link": "NOT_FOUND",
      "char_length": 0,
      "tok_length": 0,
      "url": "NOT_FOUND",
      "analysis_priority": "NOT_FOUND",
      "annotation_status": "NOT_FOUND",
      "tags": "NOT_FOUND",
      "notes": "NOT_FOUND",
      "parts": [],
      "n_reuse_instances": 0,
      "n_reuse_versions": 0
    }
  };
}

const VisualisationPage = () => {
  const {
    books,
    setBooks,
    dataLoading,
    setDataLoading,
    flipTimeLoading,
    setBooksAlignment,
    metaData,
    setMetaData,
    setChartData,
    // loadedCsvFile,
    setLoadedCsvFile,
    releaseCode,
    chartData,
    isFileUploaded,
    setIsFileUploaded,
    isError,
    setIsError,
    errorType,
    setErrorType,
    setUrl,
    defaultReleaseCode,
    setMainVersionCode,
    setVisMargins,
    defaultMargins,
    includeMetaInDownload, 
    metaPositionInDownload,
    axisLabelFontSize,
    tickFontSize, 
    setYTickWidth,
    setIsOpenDrawer,
  } = useContext(Context);

  const [isPairwiseViz, setIsPairwiseViz] = useState(false);
  const [includeURL, setIncludeURL] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Remove the ?tour=... parameter (used to start a tour automatically) from the URL
  // once a tour has ended. The tours call this from a closure that may be older than the
  // current parameters (e.g. ms1/id2, added by the chart), so the current URL is read
  // from the window instead of from searchParams.
  // `alsoRemove`: other parameters to remove (those that the tour itself has added).
  const removeTourParam = (alsoRemove = []) => {
    const hash = window.location.hash; // e.g. "#/visualise/2025.1.9/?books=...&tour=pairwise"
    // (a tour is also exited when the user leaves this page: do not navigate back then)
    if (!hash.startsWith("#/visualise")) return;
    const queryStart = hash.indexOf("?");
    if (queryStart < 0) return;
    const params = new URLSearchParams(hash.slice(queryStart + 1));
    const toRemove = ["tour", ...alsoRemove].filter((name) => params.has(name));
    if (!toRemove.length) return;
    toRemove.forEach((name) => params.delete(name));
    navigate(`${hash.slice(1, queryStart)}?${params.toString()}`, { replace: true });
  };
  const { version } = useParams();

  const [pairwiseTourRunning, setPairwiseTourRunning] = useState(false);
  const [corpuswideTourRunning, setCorpuswideTourRunning] = useState(false);
  const tourAutoStarted = useRef(false);
  const anyTourRunningRef = useRef(false);
  anyTourRunningRef.current = pairwiseTourRunning || corpuswideTourRunning;

  // When another visualisation is loaded (e.g. with the back button), a tour that is
  // still running belongs to the old chart: end it.
  const booksParam = searchParams.get("books");
  const previousBooksParam = useRef(booksParam);
  useEffect(() => {
    if (previousBooksParam.current === booksParam) return;
    previousBooksParam.current = booksParam;
    setPairwiseTourRunning(false);
    setCorpuswideTourRunning(false);
  }, [booksParam]);

  // Start the pairwise tour automatically when arriving from the "Take a tour" dropdown
  // on the landing page, once the chart has been drawn. The request is passed as a
  // ?tour=pairwise URL parameter and as a sessionStorage flag (the parameter can get lost
  // when the landing page rewrites the URL while it unmounts).
  // The same goes for the corpuswide tour (?tour=corpuswide).
  useEffect(() => {
    if (tourAutoStarted.current) return;
    const requested = (name) => {
      let found = searchParams.get("tour") === name;
      try {
        // (the flag is a time stamp: an old one, e.g. from a navigation that never
        // reached this page, must not start a tour later)
        const flagTime = Number(sessionStorage.getItem(`kitab-start-${name}-tour`));
        found = found || (flagTime > 0 && Date.now() - flagTime < 2 * 60 * 1000);
      } catch (e) { /* sessionStorage unavailable */ }
      return found;
    };
    let which = null;
    if (isPairwiseViz && requested("pairwise")) which = "pairwise";
    else if (!isPairwiseViz && requested("corpuswide")) which = "corpuswide";
    if (!which || !isFileUploaded) return;
    // the data must be there, and the chart drawn (up to 20 seconds):
    const dataReady = which === "pairwise"
      ? chartData?.dataSets?.length
      : chartData?.msData?.length;
    if (!dataReady) return;
    const drawnSelector = which === "pairwise"
      ? "#firstchart .bar"
      : "#scatterChart circle.dot";
    let waited = 0;
    const timer = setInterval(() => {
      waited += 300;
      const drawn = document.querySelector(drawnSelector);
      if (!drawn && waited < 20000) return;
      clearInterval(timer);
      setTimeout(() => {
        // never start a tour while another one is running (e.g. after the back button)
        if (tourAutoStarted.current || anyTourRunningRef.current) return;
        tourAutoStarted.current = true;
        try { sessionStorage.removeItem(`kitab-start-${which}-tour`); } catch (e) { /* ignore */ }
        // the request is consumed: remove it from the URL, so that going back or forward
        // to this URL does not start the tour again
        removeTourParam();
        if (which === "pairwise") setPairwiseTourRunning(true);
        else setCorpuswideTourRunning(true);
      }, 800);
    }, 300);
    return () => clearInterval(timer);
    // removeTourParam is deliberately not a dependency: it is a new function on every
    // render, which would restart this effect (and its polling) all the time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isPairwiseViz, isFileUploaded, chartData]);

  // update the margins of the graphs, based on 
  // * label font size
  // * tick font size
  // * presence of metadata
  // * presence of url
  useEffect(() => {
    const updateMargins = () => {
      
      // use the size of the axis and/or tick labels as default margins:
      const margins = { top: 10, bottom: 10, left: 10, right: 10};

      // calculate the height of a label line, based on the label font size:
      const charHeight = axisLabelFontSize; // A for risers, g for descenders; does not matter, in fact
      const lineHeight = 1.3 * charHeight;

      // LEFT MARGIN: TICK LABELS + PADDING:
      // The left margin consists of: 
      // * the default margin: 10
      // * the padding between the Y axis and the tick labels: 5
      // * the space taken by the largest tick label
      // * if axis labels are displayed: the height of the largest label 
      //                                 (may be multiple lines if wrapped)


      // 1. add space for some padding before and after the tick labels and the bar:
      const tickPadding =  5; // 5 is used as padding between axis and tick label
      margins.left += tickPadding;

      // 2. adjust the left margin to the size of the largest tick label: 
      if (isPairwiseViz) {
        // in pairwise viz, the largest tick label is 300:
        const tickWidth300 = measureSvgText("300", tickFontSize).width;
        margins.left += tickWidth300;
        setYTickWidth(tickWidth300);
      } else {
        // in one-to-many viz, there are two sets of tick labels: 
        // milestone numbers (top) and total number of reused characters (bottom)
        
        // milestone numbers: 
        const lastMs = Math.ceil(chartData?.tokens?.first / 300)
        const lastMsWidth = measureSvgText(lastMs, tickFontSize).width;

        // total number of reused characters in a book:
        const highestBookReuse = chartData?.maxTotalChMatch;
        const highestBookReuseWidth = measureSvgText(highestBookReuse, tickFontSize).width;

        const largestTickWidth = Math.max(lastMsWidth, highestBookReuseWidth);
        margins.left += largestTickWidth;        
        setYTickWidth(largestTickWidth);
      }

      // LEFT MARGIN: AXIS LABELS:

      if (isPairwiseViz && includeMetaInDownload !== "no") {        
        if (metaPositionInDownload === "left") {
          // in order to put the metadata along the Y axis,
          // we may need to break it into lines. 

          // Calculate into how many lines we will have to break 
          // (the longest of) the labels:
          const b1Label = getMetaLabel(metaData.book1, includeMetaInDownload);
          const b2Label = getMetaLabel(metaData.book2, includeMetaInDownload);
          const longestLabel = [b1Label, b2Label].sort((a, b) =>{
            return b.length - a.length
          })[0];

          const nLines = wrapTextToSvgWidth(longestLabel, 200, axisLabelFontSize).length;

          // add margin space for the required number of lines:
          margins.left += nLines * lineHeight;

          // add some additional padding: 
          margins.left += lineHeight / 2;
        } 
      } 
      if (!isPairwiseViz) {
        // adjust the left margin in a one-to-many visualization
        // if the bottom bar's label needs to be split:
        const nLines = wrapTextToSvgWidth("Characters reused", 120, axisLabelFontSize).length;
        margins.left += nLines*lineHeight;
        // add some additional padding: 
        margins.left += lineHeight / 2;
      }

      // TOP MARGIN: 

      // update the top margin of the pairwise graph in case user wants to include metadata there:
      if (isPairwiseViz && includeMetaInDownload !== "no" && metaPositionInDownload !== "left") {
        margins.top += lineHeight;
      }

      // update the top margin of the one-to-many graph if the sidebar's X label needs to be wrapped:
      if (!isPairwiseViz){
        const nLines = wrapTextToSvgWidth("Characters reused", 120, axisLabelFontSize).length;
        margins.top += nLines * lineHeight;
      }

      // BOTTOM MARGIN: 

      // update the top margin of the pairwise graph in case user wants to include metadata there:
      if (isPairwiseViz && includeMetaInDownload !== "no" && metaPositionInDownload !== "left") {
        margins.bottom += 2*lineHeight;
      } 
      
      if (!isPairwiseViz) {
        // adjust the bottom margin based on the tick font size: 
        margins.bottom += tickFontSize;

        // adjust the bottom margin of the one-to-many viz 
        // based on label font size (taking into account that it may be wrapped):
        let bottomLabelText = "Books for which passim detected text reuse with "
        bottomLabelText += metaData?.book1?.bookTitle?.path || "";
        bottomLabelText += " (chronologically arranged)";
        const nLabelLines = wrapTextToSvgWidth(
          bottomLabelText, 
          1000 - margins.left - margins.right, 
          axisLabelFontSize
        ).length;
        margins.bottom += nLabelLines * lineHeight;
      }

      setVisMargins(margins);
      console.log(margins);
    };
    updateMargins();
  }, [
    chartData,
    setVisMargins, 
    defaultMargins,
    includeMetaInDownload, 
    metaPositionInDownload,
    axisLabelFontSize,
    tickFontSize,
    metaData, 
    isPairwiseViz,
    setYTickWidth
  ]);

  const handleUpload = async (upload) => {
    setInitialValues({
      dataLoading,
      setIsFileUploaded,
      setDataLoading,
      setMetaData,
      setChartData,
      setBooksAlignment,
      setBooks,
    });
    setDataLoading({ ...dataLoading, uploading: true });
    //console.log("UPLOAD:");
    //console.log(upload); // upload is a Filelist object
    console.log(upload[0]);
    if (upload.length === 1 && !(upload[0].name.includes("_all"))) {
    //if (upload.length === 1) {
      // only 1 file uploaded => this should be a pairwise visualisation!
      setIsPairwiseViz(true);

      upload = upload[0]; 
      const CSVFile = upload;
      const csvFileName = upload?.name;
      const book_names = csvFileName.split("_");

      setTimeout(async () => {
        // try to get the metadata of both books from the API (using the filename):
        const bookMeta = await getVersionMeta(releaseCode, book_names);
        let book1, book2;
        if (book_names.length === 2) {
          // use both filename parts as identifiers of the books:
          book1 = bookMeta.book1;
          book2 = bookMeta.book2;

          // if a book was not found in the metadata api, create an object with default values:
          if (book1.version_code === undefined){
            console.log("No metadata found for book 1");
            book1 = buildPlaceholderMeta(book_names[0]);
          };
          if (book2.version_code === undefined){
            console.log("No metadata found for book 2");
            book2 = buildPlaceholderMeta(book_names[1].replace(".csv", ""));
          };
        } else {
          // load this data in the pairwise visualisation with default book names:
          book1 = buildPlaceholderMeta(book_names[0].replace(".csv", "")+"_book1");
          book2 = buildPlaceholderMeta(book_names[0].replace(".csv", "")+"_book2");
        }

        setPairwiseVizData({
          book1,
          book2,
          CSVFile,
          dataLoading,
          setDataLoading,
          setMetaData,
          releaseCode,
          getMetadataObject,
          setChartData,
          setIsError,
          setIsFileUploaded,
          navigate,
          csvFileName,
          setUrl,
        });
      /*} else {

          setDataLoading({ ...dataLoading, uploading: false });
          setIsError(true);
        }*/
      }, 1000);

    } else if (upload.length === 2){
      console.log("UPLOADING ONE-TO-MANY DATA");
      //try {
      console.log("trying...");
      // ONE TO ALL VISUALISATION
      setIsPairwiseViz(false);
      setIsLoading(false);

      // get the version code for book1:
      let book1Code = null;
      let msdataFile = null;
      let statsFile = null;
      console.log(upload);
      if (upload[0].name.endsWith("_all.csv")){
        book1Code = upload[0].name.replace("_all.csv", "");
        msdataFile = upload[0];
        statsFile = upload[1];
      } else if (upload[1].name.endsWith("_all.csv")){
        book1Code = upload[1].name.replace("_all.csv", "");
        msdataFile = upload[1];
        statsFile = upload[0];
      }
      //const book_names = [book1Code, ];
      const book1 = buildPlaceholderMeta(book1Code);
      setMainVersionCode(book1Code);
      console.log(book1);

      // 
      // const book1 = versionMeta.book1;

      // setMainVersionCode(book1.version_code);

      // // download msdata (from GitHub):
      // const msdataFile = await getOneBookMsData(releaseCode, book_names[0]);
      // // download stats (from GitHub):
      // const statsFile = await getOneBookReuseStats(
      //   releaseCode,
      //   book_names[0]
      // );

      // set visualisation data
      setMultiVizData({
        book1,
        isUpload: true,
        msdataFile,
        statsFile,
        dataLoading,
        setDataLoading,
        setMetaData,
        releaseCode,
        getMetadataObject,
        setChartData,
        setIsError,
        setIsFileUploaded,
        setUrl,
      });
      // } catch (err) {
      //   setDataLoading({ ...dataLoading, uploading: false });
      //   setIsError(true);
      //   setErrorType(["There was an error loading the data.", "Please check your URL and try again."]);
      //   setIsLoading(false);
      // }
      /*if (book_names[1].replace(".csv", "") == "all") {
        // load this data in the one-to-many visualisation: 
        book1 = bookMeta.book1;
        // if the book was not found in the metadata api, create an object with default values:
        if (book1.version_code === undefined){
          console.log("No metadata found for book 1");
          book1 = buildPlaceholderMeta(book_names[0]);
        };

        setMultiVizData({
          book1,
          CSVFile,
          statsFile,
          dataLoading,
          setDataLoading,
          setMetaData,
          releaseCode,
          getMetadataObject,
          setChartData,
          setIsError,
          setIsFileUploaded,
          setUrl,
        });
      }*/
    } else {
      console.log("Upload either one or two csv files, not "+upload.length)
    }
    
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isNoBook, setIsNoBook] = useState(true);

  const loadChartFromUrl = async () => {
    setInitialValues({
      dataLoading,
      setIsFileUploaded,
      setDataLoading,
      setMetaData,
      setChartData,
      setBooksAlignment,
      setBooks,
    });

    let releaseCode = version ? version : defaultReleaseCode;

    const booksParam = searchParams.get("books");
    const book_names = booksParam.split("_");

    if (book_names.length === 0) {
      setIsNoBook(true);
    } else {
      setIsNoBook(false);
    }

    // download the version metadata of all books in the URL booksParam:
    const versionMeta = await getVersionMeta(releaseCode, book_names);
    // check if there are errors in the returned metadata
    const failedBooks = checkVersionMeta(versionMeta, book_names);
    if (failedBooks.length > 0) {
      setDataLoading({ ...dataLoading, uploading: false });
      setIsError(true);
      setErrorType(["Some book Ids in your pairwise URL do not match books in the KITAB corpus. Please check your URL and try again.", "Failed Ids: " + failedBooks.join(", ")]);
      setIsLoading(false);

    } else if (book_names.length === 1 || book_names[1] === "all") {
      try {
        // ONE TO ALL VISUALISATION
        setIsPairwiseViz(false);
        setIsLoading(false);

        // get the metadata for book1:
        const book1 = versionMeta.book1;

        setMainVersionCode(book1.version_code);

        // download msdata (from GitHub):
        const msdataFile = await getOneBookMsData(releaseCode, book_names[0]);
        // download stats (from GitHub):
        const statsFile = await getOneBookReuseStats(
          releaseCode,
          book_names[0]
        );

        // set visualisation data
        setMultiVizData({
          book1,
          msdataFile,
          statsFile,
          dataLoading,
          setDataLoading,
          setMetaData,
          releaseCode,
          getMetadataObject,
          setChartData,
          setIsError,
          setIsFileUploaded,
          setUrl,
        });
      } catch (err) {
        setDataLoading({ ...dataLoading, uploading: false });
        setIsError(true);
        setErrorType(["There was an error loading the data for the book: " + book_names[0] + ".", "Please check your URL and try again."]);
        setIsLoading(false);
      }
    } else if (book_names.length === 2) {
      // try {
        // PAIRWISE VISUALISATION
        setIsPairwiseViz(true);
        const book1 = versionMeta.book1;
        const book2 = versionMeta.book2;
        const csvFileName = buildCsvFilename(book1, book2);
        
        // Use helper function to build and check csv URL
        const pairwiseCsvResponse = await checkPairwiseCsvResponse(
          releaseCode, book1, book2, false)
        
        if (pairwiseCsvResponse.pairwiseLiteUrl !== null) {
          // If the pairwise URL is valid, proceed with loading the data
          const CSVFile = await downloadCsvData(pairwiseCsvResponse.pairwiseLiteUrl);
          // remove the loadedCsvFile blob from memory (context):
          setLoadedCsvFile(null);

          setPairwiseVizData({
            book1,
            book2,
            CSVFile,
            dataLoading,
            setDataLoading,
            setMetaData,
            releaseCode,
            getMetadataObject,
            setChartData,
            setIsError,
            setIsFileUploaded,
            navigate,
            csvFileName,
            setUrl,
          });

          setIsLoading(false);

        } else {
          // If the pairwise URL is not found then set error state
          setDataLoading({ ...dataLoading, uploading: false });
          setIsError(true);
          setErrorType(["The pairwise text reuse data for the book ids: " + book_names.join(", ") + " could not be found.", "There may not be text reuse data for this pair."]);
          setIsLoading(false);
        } 

    //     // first, try to download the text reuse data from the KITAB web server:
    //     const csvFileName = buildCsvFilename(book1, book2);
    //     let passimFolder = lightSrtFolders[releaseCode];
    //     let url = `${passimFolder}/${book_names[0]}/${csvFileName}`;

    //     // download the pairwise passim data if it was not downloaded/uploaded yet:
    //     let CSVFile = loadedCsvFile || (await downloadCsvData(url));

    //     // if this fails: try to download it from GitHub:
    //     if (CSVFile instanceof Error) {
    //       passimFolder = srtFoldersGitHub[releaseCode];
    //       url = `${passimFolder}/${book_names[0]}/${csvFileName}`;
    //       CSVFile = await downloadCsvData(url);
    //     }
    //     // remove the loadedCsvFile blob from memory (context):
    //     setLoadedCsvFile(null);

    //     setPairwiseVizData({
    //       book1,
    //       book2,
    //       CSVFile,
    //       dataLoading,
    //       setDataLoading,
    //       setMetaData,
    //       releaseCode,
    //       getMetadataObject,
    //       setChartData,
    //       setIsError,
    //       setIsFileUploaded,
    //       navigate,
    //       csvFileName,
    //       setUrl,
    //     });

    //     setIsLoading(false);
    //   } catch (err) {
    //     setDataLoading({ ...dataLoading, uploading: false });
    //     setIsError(true);
    //     setIsLoading(false);
    //   }
    } else {
      setDataLoading({ ...dataLoading, uploading: false });
      setIsError(true);
      setErrorType(['You have not supplied a valid URL.', ''])
      setIsLoading(false);
    }
  };

  // handle loading visualisation data from the URL:
  useEffect(() => {
    const booksInUrl = searchParams.get("books") ? true : false;
    if (booksInUrl) {
      loadChartFromUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseCode, searchParams.get("books")]);
  // Start one of the tours (also used by the links to other tours inside a tour)
  const handleStartTour = (key) => {
    if (key === "pairwise") {
      if (isPairwiseViz) {
        setPairwiseTourRunning(true);
      } else {
        // not on a pairwise chart: open the demo pair, which starts the tour
        try { sessionStorage.setItem("kitab-start-pairwise-tour", String(Date.now())); } catch (e) { /* ignore */ }
        tourAutoStarted.current = false;
        navigate(`/visualise/${releaseCode}/?books=${DEMO_BOOKS}&tour=pairwise`);
      }
    } else if (key === "corpuswide") {
      if (!isPairwiseViz && chartData?.msData?.length) {
        setCorpuswideTourRunning(true);
      } else {
        // not on a corpus-wide chart: open the demo book, which starts the tour
        try { sessionStorage.setItem("kitab-start-corpuswide-tour", String(Date.now())); } catch (e) { /* ignore */ }
        tourAutoStarted.current = false;
        navigate(`/visualise/${releaseCode}/?books=${CORPUSWIDE_DEMO_BOOKS}&tour=corpuswide`);
      }
    } else if (key === "main") {
      try { sessionStorage.setItem(MAIN_TOUR_REQUEST, "1"); } catch (e) { /* ignore */ }
      navigate(`/${releaseCode}/`);
    }
  };

  return (
    <Box
      mx={"auto"}
      display={"flex"}
      flexDirection={"column"}
      sx={{
        width: {
          xs: "100%",
          xl: "1280px",
        },
        py: "50px",
        float: {
          xs: "left",
          sm: "inherit",
        },
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <Header
        isPairwiseViz={isPairwiseViz}
        onStartTour={handleStartTour}
      />
      <PairwiseVisualizationTour
        run={pairwiseTourRunning}
        setIsOpenDrawer={setIsOpenDrawer}
        onExit={() => {
          setPairwiseTourRunning(false);
          removeTourParam();
        }}
      />
      <CorpuswideVisualizationTour
        run={corpuswideTourRunning}
        onSwitchTour={handleStartTour}
        onExit={() => {
          setCorpuswideTourRunning(false);
          // the tour selects a dot (ms1, id2) and opens its DiffViewer (align_no)
          removeTourParam(["ms1", "id2", "align_no"]);
        }}
      />
      {isError ? (
        <Box
          height="200px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h4">No data found to visualize.</Typography>
          <Typography variant="body1" color="grey">
            {errorType[0]}
          </Typography>
          <Typography variant="body1" color="grey">
            {errorType[1]}
          </Typography>
        </Box>
      ) : (
        <Box position="relative">
          {flipTimeLoading && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "#F0F0F5",
                  opacity: 0.6,
                  zIndex: 9999,
                }}
              ></Box>
              <LoaderIcon />
            </>
          )}
          {isPairwiseViz || isNoBook ? (
            <UploadInput
              item={{ title: "Upload TSV File" }}
              handleUpload={handleUpload}
            />
          ) : null}
          {isLoading && !isNoBook && <CircularInterminate />}
          {isFileUploaded ? (
            <>
              {chartData?.dataSets?.length || chartData?.msData?.length ? (
                isPairwiseViz ? (
                  <Visual isPairwiseViz={isPairwiseViz} includeURL={includeURL} setIncludeURL={setIncludeURL} />
                ) : !chartData?.msData?.length ? (
                  // stale pairwise data from an earlier visualisation, while the
                  // one in the URL is still being loaded: do not render it as one-to-many
                  <CircularInterminate />
                ) : (
                  <MultiVisual isPairwiseViz={isPairwiseViz} handleUpload={handleUpload} includeURL={includeURL} setIncludeURL={setIncludeURL} />
                )
              ) : chartData?.dataSets?.length ? (
                <CircularInterminate />
              ) : null}

              {!dataLoading?.books && books ? (
                <Books />
              ) : (
                books && <CircularInterminate />
              )}

              <div id={"belowBooks"} />
            </>
          ) : isNoBook ? null : (
            <CircularInterminate />
          )}
        </Box>
      )}
    </Box>
  );
};

export default VisualisationPage;
