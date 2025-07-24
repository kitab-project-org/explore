import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useContext } from "react";
import PaginationComponent from "../../Common/PaginationComponent";
import DownloadData from "./DownloadData";
import FilterNavigation from "./FilterNavigation";
import { Context } from "../../../App";
import {
  //getTextReuseBooksTSV,
  downloadCsvData,
} from "../../../services/TextReuseData";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import { lightSrtFolders, srtFoldersGitHub, srtFolders } from "../../../assets/srtFolders";
import { buildPairwiseCsvURL } from "../../../utility/Helper"

import { setInitialValues } from "../../../functions/setInitialValues";
import { getMetadataObject } from "../../../functions/getMetadataObject";
import { setPairwiseVizData } from "../../../functions/setVisualizationData";
// import { csv } from "d3";

const NavigationAndStats = () => {
  const {
    setMetaData,
    setChartData,
    setLoadedCsvFile,
    dataLoading,
    setDataLoading,
    setBooks,
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
    setCheckedNotification,
    setIsOpenDrawer,
    setBooksAlignment,
    setIsFileUploaded,
    setIsError,
    setUrl,
  } = useContext(Context);
  const navigate = useNavigate();
  const [displaySelected, setDisplaySelected] = useState(false);

  // Default the URLs to null - if null, no download or visualisation will be possible (and we can show a message):
  const [pairwiseLiteUrl, setPairwiseLiteUrl] = useState(null);
  const [pairwiseUrl, setPairwiseUrl] = useState(null);
  const [pairwiseFileName, setPairwiseFileName] = useState(null);

  // Check if relevant parts have been loaded before we try to build the URLs and check them
  // If the lite url is 
  const booksReady =
    checkedBooks[0]?.release_version?.url &&
    checkedBooks[1]?.release_version?.url &&
    releaseCode &&
    srtFolders[releaseCode];

  useEffect(() => {
    if (!booksReady) return;
    const checkSelectedUrls = async () => {
      console.log(checkedBooks);
      if (checkedBooks.length !== 2) {
        // If we have not selected two books, then set these pairwise parameters to null
        setPairwiseLiteUrl(null);
        setPairwiseUrl(null);
        setPairwiseFileName(null);
        return;
        
        }
      else {    
      
        const book1 = checkedBooks[0];
        const book2 = checkedBooks[1];
        const book1Filename = book1?.release_version?.url.split("/").slice(-1)[0];
        const book1Code = book1Filename.split(".").slice(2).join(".");
        const book2Filename = book2?.release_version?.url.split("/").slice(-1)[0];
        const book2Code = book2Filename.split(".").slice(2).join(".");

      // Create URLs for the selected books - if URL returns a response, then we set the variable
      const LiteUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, true);
      const fullUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, false);
      const csvFileName = `${book1Code}_${book2Code}.csv`;
      setPairwiseFileName(csvFileName);

      // Check the URLs - if they are valid then set the state variables
      // If the URL is not valid, then set the state variable to null
      try {
        const responseLite = await fetch(LiteUrl, { method: 'HEAD' });
        if (responseLite.ok) {
          setPairwiseLiteUrl(LiteUrl);
          } else {
            setPairwiseLiteUrl(null);
          }
        } catch (error) {
              
            const srtFolder = srtFoldersGitHub[releaseCode];
            const csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;
            const responseGitHub = await fetch(csvUrl, { method: 'HEAD' });
            if (responseGitHub.ok) {
              setPairwiseLiteUrl(csvUrl);
            } else {
              setPairwiseLiteUrl(null);
              console.log("No URL found for pairwise Lite data");
          }
          };
      try {
        const responseFull = await fetch(fullUrl, { method: 'HEAD' });
        if (responseFull.ok) {
          setPairwiseUrl(fullUrl);
          } else {
            setPairwiseUrl(null);
          }
        } catch (error) {
          console.log("No URL found for pairwise Full data");
          setPairwiseUrl(null);
        }
        }
      };
    checkSelectedUrls();
    }, [checkedBooks, releaseCode, booksReady, pairwiseFileName, pairwiseUrl, pairwiseLiteUrl]);

  // Download the text reuse data from the server - getting the full data file:
  const downloadTextReuseData = async (downloadUrl) => {

    if (downloadUrl !== null) {

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = pairwiseFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
  }
  

  // Load the book visualisation from the checked versions in metadata table:
  const loadChartFromSelected = async () => {
    // reset context values:
    setIsOpenDrawer(false);
    setInitialValues({
      dataLoading,
      setDataLoading,
      setIsFileUploaded,
      setMetaData,
      setChartData,
      setBooksAlignment,
      setBooks,
      setLoadedCsvFile,
    });

    // prepare the metadata for both book versions:
    const book1 = checkedBooks[0];
    const book2 = checkedBooks[1];

    // build the link to the text reuse pair:
    const book1Filename = book1?.release_version?.url.split("/").slice(-1)[0];
    const book1Code = book1Filename.split(".").slice(2).join(".");
    const book2Filename = book2?.release_version?.url.split("/").slice(-1)[0];
    const book2Code = book2Filename.split(".").slice(2).join(".");
    let srtFolder = lightSrtFolders[releaseCode];
    const csvFileName = `${book1Code}_${book2Code}.csv`;
    let csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;

    console.log("PairwiseLitUrl: ", pairwiseLiteUrl);

    // Download the pairwise text reuse data from the KITAB webserver:
    let CSVFile = await downloadCsvData(pairwiseLiteUrl);
    setLoadedCsvFile(CSVFile);

    // if this fails: try to download it from GitHub:
    if (CSVFile instanceof Error) {
      srtFolder = srtFoldersGitHub[releaseCode];
      csvUrl = `${srtFolder}/${book1Code}/${csvFileName}`;
      CSVFile = await downloadCsvData(csvUrl);
    }

    if (Error.prototype.isPrototypeOf(CSVFile)) {
      // If the csv file is not found on the server, show an error message:
      setCheckedNotification("Data Not Available: " + csvUrl);
      setTimeout(() => {
        setCheckedNotification("");
      }, 10000);
      return null;
    } else {
      // show the visualization
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
      //showPairwiseData({csvFileName, CSVFile, book1, book2, releaseCode,
      //            setChartData, setIsError, dataLoading, setDataLoading, navigate});
      // stop the spinners:
      setIsFileUploaded(true);
      setDataLoading({ ...dataLoading, uploading: false, chart: false });
    }
  };

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
          sm={1}
          md={4}
          lg={6}
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
              <Tooltip
                placement="top"
                title={
                  (displaySelected ? "Hide " : "Display ") +
                  "selected text versions"
                }
              >
                <IconButton
                  sx={{ fontSize: "15px", color: "#2863A5", ml: "5px" }}
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

          <Box>{rows && <DownloadData data={rows} status={status} />}</Box>

          {checkedBooks.length === 0 ? (
            ""
          ) : checkedBooks.length === 1 ? (
            <Typography ml="10px" color="#fbbf24" sx={{ width: "max-content" }}>
              Select a second book to visualise pairwise text reuse
            </Typography>
          ) : checkedBooks.length < 3 && pairwiseLiteUrl == null ? (
            <Typography ml="10px" color="#fbbf24" sx={{ width: "max-content" }}>
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
                    sx={{ fontSize: "15px" }}
                    disabled={checkedBooks.length < 3 ? false : true}
                    onClick={() => loadChartFromSelected()}
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
                    : "Download Pairwise File in CSV format"
                    : "Select 2 books to download a file with pairwise text reuse"
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px" }}
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
                    "Lite Pairwise File not available for selected books"
                    : "Download Lite Pairwise File in CSV format"
                    : "Select 2 books to download a file with pairwise text reuse"
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px" }}
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
          {checkedBooks.length !== 0 && (
            <Box ml={checkedBooks.length === 1 ? "20px" : "0px"}>
              <Tooltip title={"Deselect All"} placement="top">
                <span>
                  <IconButton
                    size="large"
                    variant="text"
                    sx={{ fontSize: "15px" }}
                    onClick={() => setCheckedBooks([])}
                  >
                    <i className="fa-regular fa-square-minus"></i>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Grid>

        {totalRecords ? (
          <Grid
            item
            sm={1}
            md={8}
            lg={6}
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
