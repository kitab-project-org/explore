import { useContext, useEffect, useState } from "react";
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
import { lightSrtFolders, srtFoldersGitHub } from "../../assets/srtFolders";
import { Context } from "../../App";


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
    "version_uri": "NOT_FOUND",
    "language": "undefined",
    "text": {
        "text_uri": "NOT_FOUND",
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
    setMetaData,
    setChartData,
    loadedCsvFile,
    setLoadedCsvFile,
    releaseCode,
    chartData,
    isFileUploaded,
    setIsFileUploaded,
    isError,
    setIsError,
    setUrl,
    defaultReleaseCode,
    setMainVersionCode,
  } = useContext(Context);

  const [isPairwiseViz, setIsPairwiseViz] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { version } = useParams();

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

    } else {
      console.log("UPLOADING ONE-TO-MANY DATA?");
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

    if (book_names.length === 1 || book_names[1] === "all") {
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
        setIsLoading(false);
      }
    } else if (book_names.length === 2) {
      try {
        // PAIRWISE VISUALISATION
        setIsPairwiseViz(true);
        const book1 = versionMeta.book1;
        const book2 = versionMeta.book2;
        // first, try to download the text reuse data from the KITAB web server:
        const csvFileName = buildCsvFilename(book1, book2);
        let passimFolder = lightSrtFolders[releaseCode];
        let url = `${passimFolder}/${book_names[0]}/${csvFileName}`;

        // download the pairwise passim data if it was not downloaded/uploaded yet:
        let CSVFile = loadedCsvFile || (await downloadCsvData(url));

        // if this fails: try to download it from GitHub:
        if (CSVFile instanceof Error) {
          passimFolder = srtFoldersGitHub[releaseCode];
          url = `${passimFolder}/${book_names[0]}/${csvFileName}`;
          CSVFile = await downloadCsvData(url);
        }
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
      } catch (err) {
        setDataLoading({ ...dataLoading, uploading: false });
        setIsError(true);
        setIsLoading(false);
      }
    } else {
      setDataLoading({ ...dataLoading, uploading: false });
      setIsError(true);
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
  }, [releaseCode]);
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
      <Header isPairwiseViz={isPairwiseViz} />
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
            We may not have text reuse data for these texts, or there might be
            another problem.
          </Typography>
          <Typography variant="body1" color="grey">
            [Please make sure the file name is correct]
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
                  <Visual isPairwiseViz={isPairwiseViz} />
                ) : (
                  <MultiVisual isPairwiseViz={isPairwiseViz} />
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
