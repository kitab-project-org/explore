import { Box, Link, Tooltip, Typography } from "@mui/material";
import { useContext } from "react";
import { REPO_NAME } from "../../Common/NavigationBar";
import { Context } from "../../../App";

const Section = ({ data }) => {
  const { releaseCode, toggleSidePanel } = useContext(Context);
  if (!data) {
    console.log("do not display metadata: null");
    return null;
  }

  const isManuscript = !data?.bookTitle;
  const repoBase = !REPO_NAME ? "" : `/${REPO_NAME}`;
  const metadataSearch = (term) =>
    `${repoBase}/metadata?search=${term ?? ""}`;

  return (
    <Box display={"flex"} flexDirection={"row"} gap={4} width={"70%"}>

      {/* Version Code */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
        <Typography fontWeight={600} sx={{ fontSize: "12px" }}>Version Code</Typography>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Tooltip title="Open metadata panel">
            <Link sx={{ color: "grey", cursor: "pointer" }}
              onClick={() => toggleSidePanel({ version_id: data?.versionCode, release_code: releaseCode }, 2)}
            >
              <Typography sx={{ fontSize: "12px" }}>{data?.versionCode ?? "N/A"}</Typography>
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link sx={{ textDecoration: "none" }} href={metadataSearch(data?.versionCode)} target="_blank">
              <i className="fa-solid fa-up-right-from-square" style={{ fontSize: "12px", marginLeft: "5px" }} />
            </Link>
          </Tooltip>
        </Box>
      </Box>

      {/* Book Title / Shelfmark */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: "12px" }} fontWeight={600}>
          {isManuscript ? "Shelfmark" : "Book Title"}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Tooltip title="Open metadata panel">
            <Link sx={{ color: "grey", cursor: "pointer" }}
              onClick={() => toggleSidePanel({ version_id: data?.versionCode, release_code: releaseCode }, 1)}
            >
              <Typography sx={{ fontSize: "12px" }}>
                {isManuscript ? (data?.shelfmark ?? "N/A") : (data?.bookTitle?.label ?? "N/A")}
              </Typography>
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link sx={{ textDecoration: "none" }}
              href={isManuscript
                ? metadataSearch(data?.shelfmark)
                : metadataSearch(data?.bookTitle?.path)}
              target="_blank"
            >
              <i className="fa-solid fa-up-right-from-square" style={{ fontSize: "12px", marginLeft: "5px" }} />
            </Link>
          </Tooltip>
        </Box>
      </Box>

      {/* Book Author / Manuscript Holding */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: "12px" }} fontWeight={600}>
          {isManuscript ? "Manuscript Holding" : "Book Author"}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Tooltip title="Open metadata panel">
            <Link sx={{ color: "grey", cursor: "pointer" }}
              onClick={() => toggleSidePanel({ version_id: data?.versionCode, release_code: releaseCode }, 0)}
            >
              <Typography sx={{ fontSize: "12px" }}>
                {isManuscript ? (data?.manuscriptHolding ?? "N/A") : (data?.bookAuthor ?? "N/A")}
              </Typography>
            </Link>
          </Tooltip>
          <Tooltip title="Open in metadata app">
            <Link sx={{ textDecoration: "none" }}
              href={isManuscript
                ? metadataSearch(data?.manuscriptHolding)
                : metadataSearch(data?.bookTitle?.path?.split(".")[0])}
              target="_blank"
            >
              <i className="fa-solid fa-up-right-from-square" style={{ fontSize: "12px", marginLeft: "5px" }} />
            </Link>
          </Tooltip>
        </Box>
      </Box>

      {/* Death Date — books only */}
      {!isManuscript && (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
          <Typography sx={{ fontSize: "12px", paddingBottom: "4.5px" }} fontWeight={600}>
            Death Date
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
            {data?.bookTitle?.path
              ? `${parseInt(data.bookTitle.path.slice(0, 4))} AH`
              : "N/A"}
          </Typography>
        </Box>
      )}

      {/* Word Count */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: "12px", paddingBottom: "4.5px" }} fontWeight={600}>
          Word Count
        </Typography>
        <Typography sx={{ fontSize: "12px" }}>
          {data?.wordCount
            ? `${data.wordCount} (${Math.ceil(data.wordCount / 300)} milestones)`
            : "N/A"}
        </Typography>
      </Box>

    </Box>
  );
};

export default Section;
