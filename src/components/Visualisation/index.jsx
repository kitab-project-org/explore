import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../App";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Header from "./Header";
import UploadInput from "./UploadInput";
import Visual from "./Chart";
import MultiVisual from "./MultiChart";
import { getVersionMeta } from "../../functions/getVersionMeta";
import LoaderIcon from "../Common/LoaderIcon";
import Books from "./Books";
import CircularInterminate from "./CircularIndeterminate";
import { getMetadataObject } from "../../functions/getMetadataObject";
import { setInitialValues } from "../../functions/setInitialValues";
import {
  setPairwiseVizData,
  setMultiVizData,
} from "../../functions/setVisualizationData";
import {
  downloadCsvData,
  getOneBookReuseStats,
  getOneBookMsData,
} from "../../services/TextReuseData";
import { lightSrtFolders, srtFoldersGitHub } from "../../assets/srtFolders";

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

  const [isPairwiseViz, setIsPairwiseViz] = useState(true);

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

    const csvFileName = upload?.name;
    const book_names = csvFileName.split("_");

    setTimeout(async () => {
      if (book_names.length === 2) {
        const bookMeta = await getVersionMeta(releaseCode, book_names);
        const book1 = bookMeta.book1;
        const book2 = bookMeta.book2;
        const CSVFile = upload;

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
          isUploading: true,
        });
      } else {
        setDataLoading({ ...dataLoading, uploading: false });
        setIsError(true);
      }
    }, 1000);
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

        if (book1) {
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
        } else {
          setIsError(true);
        }
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

        const storedBooks = localStorage.getItem("books")
          ? JSON.parse(localStorage.getItem("books"))
          : null;

        if (storedBooks) {
          if (
            storedBooks?.book1 === book1.version_code &&
            storedBooks?.book2 === book2.version_code
          ) {
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
              storedBooksAvailable: true,
            });

            setIsLoading(false);
          } else {
            localStorage.removeItem("books");
            localStorage.removeItem("storeVizChartData");
            setIsError(true);
            setIsLoading(false);
          }
        } else {
          localStorage.removeItem("books");
          localStorage.removeItem("storeVizChartData");
          if (CSVFile !== "404: Not Found") {
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
            setIsError(true);
            setIsLoading(false);
          }
        }
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
