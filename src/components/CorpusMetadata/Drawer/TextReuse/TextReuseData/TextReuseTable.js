import { useContext, useEffect, useState } from "react";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import TableHeader from "./TableHeader";
import { getVersionMetadataById } from "../../../../../services/CorpusMetaData";
import {  getOneBookReuseStats } from "../../../../../services/TextReuseData";
import { buildPairwiseCsvURL, checkPairwiseCsvResponse } from "../../../../../utility/Helper";
import { Context } from "../../../../../App";
import Papa from "papaparse";

const TextReuseTable = ({ b1Metadata, normalizedQuery, handleRedirectToChart, b1MetadataLoading }) => { 
  const { isOpenDrawer, setIsOpenDrawer } = useContext(Context);
  const [sortingOrder, setSortingOrder] = useState("-instances_count");
  const [statsData, setStatsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [total, setTotal] = useState(0);
  const [useGithubUrl, setUseGithubUrl] = useState(null);
  const [fullDataExists, setFullDataExists] = useState(null);
  const [liteDataExists, setLiteDataExists] = useState(null);

  // Check the server response to see if the full and lite data exists
  useEffect(() => {
    // Prevent from running at closing of the drawer
    if (!isOpenDrawer) return;
    // If we have book1 - check what kind of data can be fetched (is the server live or are we defaulting to GitHub?)
    if (b1Metadata && b1Metadata.version_uri) {      
      const releaseCode = JSON.parse(localStorage.getItem("release_code"));
      const checkServerResponse = async (book1) => {        
        const csvObj = await checkPairwiseCsvResponse(releaseCode, book1);        
        if (csvObj.githubUrl) {
          // If the GitHub URL is true, we are using GitHub as a fallback
          setUseGithubUrl(true);
          setLiteDataExists(true);
          setFullDataExists(false);
        } else {
          // If the GitHub URL is false, we are using the server
          setFullDataExists(csvObj.pairwiseUrl !== null);
          setLiteDataExists(csvObj.pairwiseLiteUrl !== null);
          setUseGithubUrl(false);
        }
        console.log(csvObj);
      }
      // Check the server response
      checkServerResponse(b1Metadata);
    }
  }, [b1Metadata, isOpenDrawer]);
      

  // fetch the stats data from GitHub:
  useEffect(() => {
    // Prevent from running at closing of the drawer
    if (!isOpenDrawer) return;

    // start the spinner
    setIsLoading(true);

    // make sure that the component is still mounted by the time the async function returns:
    const isMounted = true;

    // don't fetch the data if the book1 metadata is not yet loaded
    // (and we thus don't know yet which book1 to download stats data for)
    if (!b1Metadata || !b1Metadata.version_uri) return;

    /**
     * Get the text reuse statistics for book1 from GitHub and parse it.
     * 
     * Each object contains:
     *   - {string} id: Book 2's version ID (without language or extension)
     *   - {string} book: Book 2's book URI (date+author+title)
     *   - {number} alignments: Number of reuse alignments with the primary book
     *   - {number} ch_match: Number of matched characters in alignments between Book1 and Book2>
     */
    const fetchData = async (b1Metadata) => {
      const versionID = b1Metadata?.version_uri?.split(".").pop();
      console.log("Fetching data! "+versionID);
      const releaseCode = localStorage.getItem("release_code");
      const statsFile = await getOneBookReuseStats(
        JSON.parse(releaseCode),
        versionID
      );
      if (!isMounted) return // don't update state if unmounted
      // parse the statsFile csv:
      Papa.parse(statsFile, {
        header: true,
        dynamicTyping: true, // should convert numeric fields to integers
        skipEmptyLines: true,
        complete: (result) => {
          if (!isMounted) return // don't update state if unmounted
          setTotal(result.data.length);
          // add a lowercase version of the book URI (to make filtering easier down the line)
          // and remove the ch_match key, which is not used here.
          const stats = result.data.map(({ch_match, ...rest}) => ({
            ...rest,
            book_lc: rest.book.toLowerCase()
          }));
          setStatsData(stats);
        }
      });
    };

    // fetch the text reuse stats data:
    try {
      fetchData(b1Metadata);
      console.log("Stopping spinner")
      if (statsData.length > 0) {
        setIsLoading(false);
      }
      setIsError(false);
    } catch {
      if (isMounted) {
        setIsError(true);
        setIsLoading(false);
        setStatsData([]);
        setTotal(0);
      }
    }
  }, [b1Metadata, isOpenDrawer, statsData]);

  // filter the data whenever the search query changes:
  // NB: the query has already been lowercased and trimmed!
  useEffect(() => {
    // Prevent from running at closing of the drawer
    if (!isOpenDrawer) return;
    
    const filtered = (normalizedQuery 
      ? statsData.filter(d => d.book_lc.includes(normalizedQuery)) 
      : statsData);
    setFilteredData(filtered);
    
  }, [statsData, normalizedQuery, isOpenDrawer]);

  // Sort the filtered data:
  useEffect(() => {
    // Prevent from running at closing of the drawer
    if (!isOpenDrawer) return;

    if (!filteredData || filteredData.length === 0) setSortedData([]);

    // Create a copy of the filtered data 
    const sorted = [...filteredData];

    switch (sortingOrder) {
      case "instances_count":
        sorted.sort((a, b) => a.alignments - b.alignments);
        break;
      case "book":
        sorted.sort((a, b) => a.book.localeCompare(b.book));
        break;
      case "-book":
        sorted.sort((a, b) => b.book.localeCompare(a.book));
        break;
      default:
        sorted.sort((a, b) => b.alignments - a.alignments);
    }

    setSortedData(sorted);

  }, [filteredData, sortingOrder, isOpenDrawer]);

  /**
   * Download a csv file containing the text reuse data
   * 
   * @param {Object} b1Metadata full metadata of book1
   * @param {Object} book2ID version ID of book2
   */
  const downloadPairwiseCsv = async (b1Metadata, book2ID, light=false, github=false) => {
    // we already have full metadata of book1;
    // download the metadata for book 2 and get the ID:
    const releaseCode = JSON.parse(localStorage.getItem("release_code"));
    const b2Metadata = await getVersionMetadataById(releaseCode, book2ID);
    // build the URL to the CSV file:
    const csvUrl = await buildPairwiseCsvURL(releaseCode, b1Metadata, b2Metadata, light, github);
    const csvFilename = csvUrl.split("/").pop();
    if (github) {
        // If the URL is a GitHub URL, then we need to download it differently
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", csvFilename); // Set the file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
       }
    else {
      // create a temporary link to the csv file to trigger the download:
      const link = document.createElement('a');
      link.href = csvUrl;
      link.setAttribute('download', csvFilename); 
      document.body.appendChild(link);
      // download and clean up:
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Open the pairwise visualization
   * 
   * @param {Object} b1Metadata full metadata of book1
   * @param {Object} b2Data summary metadata of book2
   * @param {Function} handleRedirectToChart 
   */
  const openViz = async (b1Metadata, b2Data, handleRedirectToChart) => {
    // Move the focus away from the drawer before closing it:
    document.getElementById("root")?.focus();

    // close the drawer - this prevents the drawer from re-rendering
    setIsOpenDrawer(false);
    // we already have full metadata of book1;
    // download the metadata for book 2 and get the ID:
    const releaseCode = JSON.parse(localStorage.getItem("release_code"));
    const b2Metadata = await getVersionMetadataById(releaseCode, b2Data.id);
    // build the URL to the CSV file:
    const csvUrl = await buildPairwiseCsvURL(releaseCode, b1Metadata, b2Metadata);
    handleRedirectToChart({book1: b1Metadata, book2: b2Metadata, csvUrl: csvUrl});
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ float: "left", width: "100%" }}>
        <TableHeader
          sortingOrder={sortingOrder}
          setSortingOrder={setSortingOrder}
        />
        {isError && <Typography>Error loading data...</Typography> }
        {/* {isLoading || dataLoading?.uploading ? (*/}
        {isLoading || b1MetadataLoading ? (
          <Box
            sx={{
              width: "100%",
              height: "200px",
              float: "left",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            float: "left", 
            width: "100%", 
            maxHeight: "30vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: 'column',
          }}>
            {
              sortedData.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    margin: "5px 0px",
                    padding: "8px 0px",
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    float: "left",
                  }}
                >
                  <Typography
                    width={"70%"}
                    padding={"0px 15px"}
                    sx={{
                      wordWrap: "break-word",
                      float: "left",
                      fontSize: "14px",
                      wordBreak: "break-all",
                    }}
                  >
                    {item.book}
                  </Typography>
                  <Typography
                    width={"20%"}
                    padding={"0px 15px"}
                    textAlign={"center"}
                    sx={{
                      wordWrap: "break-word",
                      fontSize: "14px",
                      wordBreak: "break-all",
                    }}
                  >
                    {item?.alignments}
                  </Typography>
                  <Box
                    width={"20%"}
                    padding={"0px 15px"}
                    display={"flex"}
                    alignItems={"center"}
                  >
                  { useGithubUrl === null || fullDataExists === null || liteDataExists === null ? (<CircularProgress size={"15px"} />)
                    : (
                    <>
                    { useGithubUrl || liteDataExists ? (
                    <Tooltip placement="top" title={"Visualization"}>
                      <Typography>
                        <button
                          onClick={() => openViz(
                            b1Metadata, 
                            item, 
                            handleRedirectToChart
                          )}
                          style={{
                            background: "none",
                            border: "0px",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#7593af",
                            marginRight: "8px",
                          }}
                        >
                          <i className="fa-solid fa-barcode"></i>
                        </button>
                      </Typography>
                    </Tooltip>
                    ) : null
                    }
                    { fullDataExists ? (
                    <Tooltip placement="top" title={"Download CSV (with text of alignments)"}>
                      <Typography>
                        <IconButton
                          sx={{
                            background: "none",
                            border: "0px",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#7593af",
                          }}
                          onClick={() => downloadPairwiseCsv(b1Metadata, item.id)}
                        >
                          <i className="fa-solid fa-file"></i>
                        </IconButton>

                      </Typography>
                    </Tooltip>
                    ) : null
                    }
                    { useGithubUrl || liteDataExists ? (
                    <Tooltip placement="top" title={"Download Lite CSV (excluding text of alignments)"}>
                      <Typography>
                        <IconButton
                          sx={{
                            background: "none",
                            border: "0px",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#7593af",
                          }}
                          onClick={() => downloadPairwiseCsv(b1Metadata, item.id, true, useGithubUrl)}
                        >
                          <i className="fa-solid fa-file-half-dashed"></i>
                        </IconButton>

                      </Typography>
                    </Tooltip>
                    ) : null}
                    </>)
                  }
                  </Box>
                </Box>
              )
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "2px",
          display: "flex",
          alignItems: "center",
          margin: "5px 0px",
          padding: "8px 0px",
          bgcolor: "#7593af",
          color: "white",
          borderRadius: "5px",
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "0px",
          float: "left",
          boxShadow: '2px 4px 8px rgba(0,0,0,0.2)'
        }}
      ></Box>
      <Typography>{`Number of results: ${sortedData.length} / ${total}`}</Typography>
    </Box>
  );
};

export default TextReuseTable;
