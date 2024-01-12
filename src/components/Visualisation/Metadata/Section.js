import { Box, Link, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useContext } from "react";
import { Context } from "../../../App";

const Section = ({ data }) => {
  const { releaseCode, toggleSidePanel } = useContext(Context);
  console.log(data);
  if (data) {
    console.log("display metadata");
    return (
      <Box display={"flex"} flexDirection={"column"} gap={1} width={"50%"}>
        <Typography variant="body2" fontWeight={600}>
          Version Code :
          <Tooltip title="Open metadata panel">
            <Link
              sx={{ ml: "10px", color: "grey", cursor: "pointer" }}
              onClick={() => {
                toggleSidePanel(
                  {
                    version_id: data?.versionCode,
                    release_code: releaseCode,
                  },
                  2
                );
              }}
            >
              {data ? data?.versionCode : "N/A"}
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link
              sx={{ textDecoration: "none" }}
              href={data ? `/explore?search=${data?.versionCode}` : "/"}
              target="_blank"
            >
              {" "}
              <i className="fa-solid fa-up-right-from-square"></i>
            </Link>
          </Tooltip>
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Book Title :
          <Tooltip title="Open metadata panel">
            <Link
              sx={{ ml: "10px", color: "grey", cursor: "pointer" }}
              onClick={() => {
                toggleSidePanel(
                  {
                    version_id: data?.versionCode,
                    release_code: releaseCode,
                  },
                  1
                );
              }}
            >
              {data ? data?.bookTitle?.label : "N/A"}
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link
              sx={{ textDecoration: "none" }}
              href={data ? `/explore?search=${data?.bookTitle?.path}` : "/"}
              target="_blank"
            >
              {" "}
              <i className="fa-solid fa-up-right-from-square"></i>
            </Link>
          </Tooltip>
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Book Author :
          <Tooltip title="Open metadata panel">
            <Link
              sx={{ ml: "10px", color: "grey", cursor: "pointer" }}
              onClick={() => {
                toggleSidePanel(
                  {
                    version_id: data?.versionCode,
                    release_code: releaseCode,
                  },
                  0
                );
              }}
            >
              {data ? data?.bookAuthor : "N/A"}
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link
              sx={{ textDecoration: "none" }}
              href={
                data
                  ? `/explore?search=${data?.bookTitle?.path.split(".")[0]}`
                  : "/"
              }
              target="_blank"
            >
              {" "}
              <i className="fa-solid fa-up-right-from-square"></i>
            </Link>
          </Tooltip>
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Death Date :{" "} {data ? parseInt(data?.bookTitle?.path.slice(0,4))+" AH" : "N/A"}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Word Count :{" "}
          {data
            ? `${data?.wordCount} (${Math.ceil(
                data?.wordCount / 300
              )} milestones)`
            : "N/A"}
        </Typography>
      </Box>
    );
  } else {
    console.log("do not display metadata: null");
    return null;
  }
};

export default Section;
