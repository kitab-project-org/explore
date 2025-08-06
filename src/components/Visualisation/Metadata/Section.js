import { Box, Link, Tooltip, Typography } from "@mui/material";
import { useContext } from "react";
import { REPO_NAME } from "../../Common/NavigationBar";
import { Context } from "../../../App";

const Section = ({ data }) => {
  const { releaseCode, toggleSidePanel } = useContext(Context);
  if (data) {
    return (
      <Box display={"flex"} flexDirection={"row"} gap={4} width={"70%"}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography fontWeight={600} sx={{ fontSize: "12px" }}>
            Version Code
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Tooltip title="Open metadata panel">
              <Link
                sx={{ color: "grey", cursor: "pointer" }}
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
                <Typography sx={{ fontSize: "12px" }}>
                  {data ? data?.versionCode : "N/A"}
                </Typography>
              </Link>
            </Tooltip>
            <Tooltip title="Open in metadata app">
              <Link
                sx={{ textDecoration: "none" }}
                href={
                  data
                    ? `${!REPO_NAME ? "" : `/${REPO_NAME}`}/metadata?search=${
                        data?.versionCode
                      }`
                    : "/"
                }
                target="_blank"
              >
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={{ fontSize: "12px", marginLeft: "5px" }}
                ></i>
              </Link>
            </Tooltip>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: "12px" }} fontWeight={600}>
            Book Title
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="center">
            <Tooltip title="Open metadata panel">
              <Link
                sx={{ color: "grey", cursor: "pointer" }}
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
                <Typography sx={{ fontSize: "12px" }}>
                  {data ? data?.bookTitle?.label : "N/A"}
                </Typography>
              </Link>
            </Tooltip>
            <Tooltip title="Open in metadata app">
              <Link
                sx={{ textDecoration: "none" }}
                href={
                  data
                    ? `${!REPO_NAME ? "" : `/${REPO_NAME}`}/metadata?search=${
                        data?.bookTitle?.path
                      }`
                    : "/"
                }
                target="_blank"
              >
                {" "}
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={{ fontSize: "12px", marginLeft: "5px" }}
                ></i>
              </Link>
            </Tooltip>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: "12px" }} fontWeight={600}>
            Book Author
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Tooltip title="Open metadata panel">
              <Link
                sx={{ color: "grey", cursor: "pointer" }}
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
                <Typography sx={{ fontSize: "12px" }}>
                  {data ? data?.bookAuthor : "N/A"}
                </Typography>
              </Link>
            </Tooltip>
            <Tooltip title="Open in metadata app">
              <Link
                sx={{ textDecoration: "none" }}
                href={
                  data
                    ? `${!REPO_NAME ? "" : `/${REPO_NAME}`}/metadata?search=${
                        data?.bookTitle?.path.split(".")[0]
                      }`
                    : "/"
                }
                target="_blank"
              >
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={{ fontSize: "12px", marginLeft: "5px" }}
                ></i>
              </Link>
            </Tooltip>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", paddingBottom: "4.5px" }}
            fontWeight={600}
          >
            Death Date
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
            {data ? parseInt(data?.bookTitle?.path.slice(0, 4)) + " AH" : "N/A"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", paddingBottom: "4.5px" }}
            fontWeight={600}
          >
            Word Count
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
            {data
              ? `${data?.wordCount} (${Math.ceil(
                  data?.wordCount / 300
                )} milestones)`
              : "N/A"}
          </Typography>
        </Box>
      </Box>
    );
  } else {
    console.log("do not display metadata: null");
    return null;
  }
};

export default Section;
