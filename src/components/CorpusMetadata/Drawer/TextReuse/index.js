import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import TextReuseData from "./TextReuseData/index.js";
import { TextField } from "@mui/material";
import { srtFolders, oneToAllFolders } from "../../../../assets/srtFolders";

const DownloadSrt = ({ fullData, fullDataLoading }) => {
  const [query, setQuery] = useState("");
  const releaseCode = fullData?.release_version?.release_code;
  const passim_folder = srtFolders[releaseCode];
  const versionId = fullData?.version_uri && fullData?.release_version.url
    .split("/").slice(-1)[0]           // take the last part of the URL
    .split(".").slice(2).join(".");    // remove the book URI

  const data = [
    {
      header: `Text Reuse Folder (${fullData?.version_code})`,
      link: `${passim_folder}/${versionId}`,
    },
    {
      header: `Visualize all text reuse`,
      link: `/visualise/${releaseCode}/?books=${versionId}_all`,
    },
    {
      header: `Version URI`,
      body: fullData?.version_uri,
    },
    {
      header: `OpenITI Corpus Release`,
      body: releaseCode,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      
      <Box>
        {data.length !== 0 &&
          data.slice(2).map((item, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                display: "flex",
                margin: "5px 0px",
                borderBottom: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Box margin={"5px 0px"} width={"35%"} sx={{ textAlign: "left" }}>
                {item.header}
              </Box>
              <Box margin={"5px 0px"}>
                {item.link ? (
                  <Link
                    to={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    {item.body}
                  </Link>
                ) : (
                  item.body
                )}
              </Box>
            </Box>
          ))}
      </Box>

      <Box>
        {(data.length !== 0 && oneToAllFolders[releaseCode]) &&
          data.slice(1, 2).map((item, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                display: "flex",
                margin: "5px 0px",
                borderBottom: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Box margin={"5px 0px"} width={"100%"} sx={{ textAlign: "left" }}>
                <Link
                  to={item.link}
                  style={{ textDecoration: "none" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.header}
                  <i
                    className="fa-solid fa-magnifying-glass-chart"
                    style={{
                      marginLeft: "15px",
                      marginRight: "8px",
                      color: "#7593af",
                    }}
                  ></i>
                </Link>
              </Box>
              <Box margin={"5px 0px"}>{item.link ? "" : item.body}</Box>
            </Box>
          ))}
      </Box>

      <Box py={"30px"}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Pairwise Text Reuse Data:</Typography>
          <TextField
            id="outlined-search"
            label={"Search"}
            type="search"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              maxWidth: "50%",
              minWidth: "30%",
            }}
          />
        </Box>
        <TextReuseData fullData={fullData} query={query} setQuery={setQuery} fullDataLoading={fullDataLoading}/>
      </Box>

      <Box>
        {data.length !== 0 &&
          data.slice(0, 1).map((item, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                display: "flex",
                margin: "5px 0px",
                borderBottom: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Box margin={"5px 0px"} width={"100%"} sx={{ textAlign: "left" }}>
                <i
                  className="fa-solid fa-folder"
                  style={{
                    marginLeft: "15px",
                    marginRight: "8px",
                    color: "#7593af",
                  }}
                ></i>
                <Link
                  to={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  {item.header}
                </Link>
              </Box>
              <Box margin={"5px 0px"}>{item.link ? "" : item.body}</Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default DownloadSrt;
