import { useContext } from "react";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import PaginationComponent from "../../Common/PaginationComponent";
import DownloadData from "./DownloadData";
import FilterNavigation from "./FilterNavigation";
import { Context } from "../../../App";
// import {
//   //getTextReuseBooksTSV,
//   // downloadCsvData,
// } from "../../../services/TextReuseData";
// import { useNavigate } from "react-router-dom";
import { Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import { 
  // lightSrtFolders, 
  // srtFoldersGitHub, 
  srtFolders } from "../../../assets/srtFolders";
import { loadChartFromUrl, checkPairwiseCsvResponse} from "../../../utility/Helper"

// import { setInitialValues } from "../../../functions/setInitialValues";
// import { getMetadataObject } from "../../../functions/getMetadataObject";
// import { setPairwiseVizData } from "../../../functions/setVisualizationData";
import { CircularProgress } from "@mui/material";

// import { csv } from "d3";

const NavigationAndStats = () => {
  const {
    // setMetaData,
    // setChartData,
    // setLoadedCsvFile,
    // dataLoading,
    // setDataLoading,
    // setBooks,
    showFilters,
    totalRecords,
    rows,
    status,
    rowsPerPage,
    page,
    checkedBooks,
    setCheckedBooks,
    releaseCode,
    checkedNotification,
    // setCheckedNotification,
    // setIsOpenDrawer,
    // setBooksAlignment,
    // setIsFileUploaded,
    // setIsError,
    // setUrl,
  } = useContext(Context);
  // const navigate = useNavigate();
  const [displaySelected, setDisplaySelected] = useState(false);

  // Default the URLs to null - if null, no download or visualisation will be possible (and we can show a message):
  const [pairwiseLiteUrl, setPairwiseLiteUrl] = useState(null);
  const [pairwiseUrl, setPairwiseUrl] = useState(null);
  const [pairwiseFileName, setPairwiseFileName] = useState(null);
  const [githubUrl, setGithubUrl] = useState(false);
  const [idPair, setIdPair] = useState(null);
  const [loadingReuseData, setLoadingReuseData] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);

  // Check if relevant parts have been loaded before we try to build the URLs and check them
  // If the lite url is 
  const booksReady =
    checkedBooks[0]?.release_version?.url &&
    checkedBooks[1]?.release_version?.url &&
    releaseCode &&
    srtFolders[releaseCode];

  // Function to delay showing a loading message - avoids page flickering when data loads quickly
  useEffect(() => {
      let timer;
      if (loadingReuseData === true) {
        timer = setTimeout(() => setShowLoadingMessage(true), 1000);
      } else {
        setShowLoadingMessage(false);
      }

    return () => clearTimeout(timer);
    }, [loadingReuseData]);
  
  useEffect(() => {
    if (!booksReady) return;
    const checkSelectedUrls = async () => {

      

      if (checkedBooks.length !== 2) {
        // If we have not selected two books, then set these pairwise parameters to null
        setPairwiseLiteUrl(null);
        setPairwiseUrl(null);
        setPairwiseFileName(null);
        return;
        
        }
      else {
        console.log("Checking selected books for pairwise text reuse data");

        // Activate the loading function - allows us to show a loading spinner after a delay (to avoid flickering)
        setLoadingReuseData(true);
        
        // Use selected books to get necessary data for building and checking URLs
        const book1 = checkedBooks[0];
        const book2 = checkedBooks[1];
        const book1Filename = book1?.release_version?.url.split("/").slice(-1)[0];
        const book1Code = book1Filename.split(".").slice(2).join(".");
        const book2Filename = book2?.release_version?.url.split("/").slice(-1)[0];
        const book2Code = book2Filename.split(".").slice(2).join(".");

        const csvFileName = `${book1Code}_${book2Code}.csv`;
        setPairwiseFileName(csvFileName);

        const idPair = `${book1Code}_${book2Code}`;
        setIdPair(idPair);

        // Create and check the URLs - func will return null for either if URL does not exist
        const urlObj = await checkPairwiseCsvResponse(releaseCode, book1, book2, true);
        console.log(urlObj)
        setPairwiseUrl(urlObj.pairwiseUrl);
        setPairwiseLiteUrl(urlObj.pairwiseLiteUrl);
        setGithubUrl(urlObj.githubUrl);


        // // Create URLs for the selected books - if URL returns a response, then we set the variable
        // const LiteUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, true);
        // const fullUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, false);


        // // Check the URLs - if they are valid then set the state variables
        // // If the URL is not valid, then set the state variable to null
        // try {
        //   const responseFull = await fetch(fullUrl, { method: 'HEAD' });
        //   if (responseFull.ok) {
        //     setPairwiseLiteUrl(LiteUrl);
        //     setPairwiseUrl(fullUrl)
        //     } else {
        //       setPairwiseLiteUrl(null);
        //     }
        //   } catch (error) {
              
        //       const srtFolder = srtFoldersGitHub[releaseCode];
        //       const csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;
        //       console.log(`Fetching data from Github with URL:${csvUrl}`);  
        //       const responseGitHub = await fetch(csvUrl, { method: 'HEAD' });
        //       if (responseGitHub.ok) {
        //         setPairwiseLiteUrl(csvUrl);
        //         setGithubUrl(true);
        //       } else {
        //         setPairwiseLiteUrl(null);
        //         console.log("No URL found for pairwise Lite data");
        //     }
        //     };
        // try {
        //   const responseFull = await fetch(fullUrl, { method: 'HEAD' });
        //   if (responseFull.ok) {
        //     setPairwiseUrl(fullUrl);
        //     } else {
        //       setPairwiseUrl(null);
        //     }
        //   } catch (error) {
        //     console.log("No URL found for pairwise Full data");
        //     setPairwiseUrl(null);
        //   }
        setLoadingReuseData(false);
        }
      };
    checkSelectedUrls();
    }, [checkedBooks, releaseCode, booksReady]);

  // Download the text reuse data from the server - getting the full data file:
  const downloadTextReuseData = async (downloadUrl) => {

    if (downloadUrl !== null) {
      if (githubUrl) {
        // If the URL is a GitHub URL, then we need to download it differently
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", pairwiseFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
       }
      else {
      
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = pairwiseFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } 
  }


  

  // Below function is the original one that was used to load 
  // the pairwise visualisation from the checked books in the metadata table
  // It loads the visualisation in the same window - and duplicates the data loading - replaced by loadChartFromUrl
  // // Load the book visualisation from the checked versions in metadata table:
  // const loadChartFromSelected = async () => {
  //   // reset context values:
  //   setIsOpenDrawer(false);
  //   setInitialValues({
  //     dataLoading,
  //     setDataLoading,
  //     setIsFileUploaded,
  //     setMetaData,
  //     setChartData,
  //     setBooksAlignment,
  //     setBooks,
  //     setLoadedCsvFile,
  //   });

  //   // prepare the metadata for both book versions:
  //   const book1 = checkedBooks[0];
  //   const book2 = checkedBooks[1];

  //   // build the link to the text reuse pair:
  //   const book1Filename = book1?.release_version?.url.split("/").slice(-1)[0];
  //   const book1Code = book1Filename.split(".").slice(2).join(".");
  //   const book2Filename = book2?.release_version?.url.split("/").slice(-1)[0];
  //   const book2Code = book2Filename.split(".").slice(2).join(".");
  //   let srtFolder = lightSrtFolders[releaseCode];
  //   const csvFileName = `${book1Code}_${book2Code}.csv`;
  //   let csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;

  //   console.log("PairwiseLitUrl: ", pairwiseLiteUrl);

  //   // Download the pairwise text reuse data from the KITAB webserver:
  //   let CSVFile = await downloadCsvData(pairwiseLiteUrl);
  //   setLoadedCsvFile(CSVFile);

  //   // if this fails: try to download it from GitHub:
  //   if (CSVFile instanceof Error) {
  //     srtFolder = srtFoldersGitHub[releaseCode];
  //     csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;
  //     CSVFile = await downloadCsvData(csvUrl);
  //   }

  //   if (Error.prototype.isPrototypeOf(CSVFile)) {
  //     // If the csv file is not found on the server, show an error message:
  //     setCheckedNotification("Data Not Available: " + csvUrl);
  //     setTimeout(() => {
  //       setCheckedNotification("");
  //     }, 10000);
  //     return null;
  //   } else {
  //     // show the visualization
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
  //     //showPairwiseData({csvFileName, CSVFile, book1, book2, releaseCode,
  //     //            setChartData, setIsError, dataLoading, setDataLoading, navigate});
  //     // stop the spinners:
  //     setIsFileUploaded(true);
  //     setDataLoading({ ...dataLoading, uploading: false, chart: false });
  //   }
  // };

  const handleChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return (
        item?.release_version?.release_code ===
          value?.release_version?.release_code && item?.id === value?.id
      );
    });
    if (filter.length === 1) {
      const filter = checkedBooks.filter((item) => {
        return item?.id !== value?.id;
      });
      setCheckedBooks(filter);
    }
  };

  const isChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return item?.id === value?.id;
    });
    if (filter.length === 1) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div>
      <FilterNavigation showFilters={showFilters} />

      <Grid container>
        <Grid
          
          item
          container
          sm={12}
          md={6}
          lg={8}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: {
              xs: "space-between",
              sm: "start",
            },
            mb: {
              xs: "10px",
              sm: "0px",
            },
          }}
        >
          {totalRecords ? (
            <Box
              mr={"15px"}
              display={"flex"}
              alignItems={"center"}
              width="max-content"
            >
              <Typography variant="body1" display="block" align="left">
                Total number of results: {totalRecords}
              </Typography>
            </Box>
          ) : (
            ""
          )}

          {checkedBooks.length !== 0 && (
            <>
              <Typography>Selected: {checkedBooks.length}</Typography>

              <Box>
                <Tooltip title={"Deselect All"} placement="top">
                  <span>
                    <IconButton
                      size="large"
                      variant="text"
                      sx={{ fontSize: "15px", color: "#d01f2f", padding: "10px" }}
                      onClick={() => setCheckedBooks([])}
                    >
                      <i className="fa-regular fa-square-minus"></i>
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Tooltip
                placement="top"
                title={
                  (displaySelected ? "Hide " : "Display ") +
                  "selected text versions"
                }
              >
                <IconButton
                  sx={{ fontSize: "15px", color: "#2863A5", padding: "5px" }}
                  onClick={() => setDisplaySelected(!displaySelected)}
                >
                  {displaySelected ? (
                    <i className="fa-regular fa-eye-slash"></i>
                  ) : (
                    <i className="fa-regular fa-eye"></i>
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}
          <>
          <Box>{rows && <DownloadData data={rows} status={status} />}</Box>

          {checkedBooks.length === 0 ? (
            ""
          ) : checkedBooks.length === 1 ? (
            <Typography  color="#fbbf24" sx={{ width: "max-content", padding: "5px" }}>
              Select a second book to visualise pairwise text reuse
            </Typography>
          ) : checkedBooks.length < 3 && !showLoadingMessage &&loadingReuseData ? (
            ""
          ) : checkedBooks.length < 3 && showLoadingMessage ? (
            <Typography color="#fbbf24" sx={{ width: "max-content", padding: "5px" }}>
              <CircularProgress size={"15px"} /> Loading text reuse data for selected books...
            </Typography>
          ) : checkedBooks.length < 3 && !loadingReuseData && pairwiseLiteUrl === null ? (
            <Typography color="#fbbf24" sx={{ width: "max-content", padding: "5px" }}>
              No text reuse data available for selected books
            </Typography>
          ) : (
            <>
            <Box>
              <Tooltip
                title={
                  checkedBooks.length < 3
                    ? "Pairwise Visualisation"
                    : "One-to-Many Book Visualisation (coming soon)"
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px", padding: "5px"}}
                    disabled={checkedBooks.length < 3 ? false : true}
                    onClick={() => loadChartFromUrl(releaseCode, idPair)}
                  >
                    {checkedBooks.length < 3 ? (
                      <i
                        className="fa-solid fa-barcode"
                        style={{ color: "green" }}
                      ></i>
                    ) : (
                      <i className="fa-solid fa-chart-column"></i>
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box>
              <Tooltip
                title={
                  checkedBooks.length < 3 ? pairwiseUrl === null ?
                    "Pairwise File not available for selected books"
                    : "Download Pairwise Text Reuse Data (larger file, incl. actual text alignments)"
                    : "Select 2 books to download a file with pairwise text reuse"
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px", padding: "5px"}}
                    disabled={checkedBooks.length < 3 ? false : true}
                    onClick={() => downloadTextReuseData(pairwiseUrl)}
                  >
                    {checkedBooks.length < 3 && pairwiseUrl !== null ? (
                      <i
                        className="fa-solid fa-file"
                        style={{ color: "green" }}
                      ></i>
                    ) : (
                      <i className="fa-solid fa-file"></i>
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip
                title={
                  checkedBooks.length < 3 ? pairwiseLiteUrl === null ?
                    "Text Reuse Data not available in this format for selected books"
                    : "Download Pairwise Text Reuse Data (smaller file, excl. actual text alignments)"
                    : "Select 2 books to download pairwise text reuse data"
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px", padding: "5px" }}
                    disabled={checkedBooks.length < 3 ? false : true}
                    onClick={() => downloadTextReuseData(pairwiseLiteUrl)}
                  >
                    {checkedBooks.length < 3 && pairwiseLiteUrl !== null ? (
                      <i
                        className="fa-solid fa-file-half-dashed"
                        style={{ color: "green" }}
                      ></i>
                    ) : (
                      <i className="fa-solid fa-file-half-dashed"></i>
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </>
            
          )}
          </>
          {checkedNotification ? (
            <Box>
              <Typography
                variant="body1"
                display="block"
                align="left"
                color={"red"}
                ml={"20px"}
              >
                {checkedNotification}
              </Typography>
            </Box>
          ) : (
            ""
          )}
        </Grid>

        {totalRecords ? (
          <Grid
            
            item
            sm={12}
            md={6}
            lg={4}
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <PaginationComponent
              totalRecords={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
            />
          </Grid>
        ) : (
          ""
        )}
      </Grid>
      {displaySelected && (
        <Box mb="15px">
          {checkedBooks.map((item, i) => (
            <Box key={item.id || i} display="flex" alignItems="center">
              <Checkbox
                sx={{ width: "30px", height: "30px" }}
                size="small"
                checked={isChecked(item)}
                onChange={() => handleChecked(item)}
              />
              <Typography key={i} sx={{ ml: "5px" }}>
                {item?.version_uri}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
};

export default NavigationAndStats;
