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
    <Box className="metadata-section" display={"flex"} flexDirection={"row"} gap={4} width={"70%"}>

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
                {isManuscript ? (data?.shelfmark.split(" :: ")[0] ?? "N/A") : (data?.bookTitle?.label.split(" :: ")[0] ?? "N/A")}
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
                {isManuscript ? (data?.manuscriptHolding.split(" :: ")[0] ?? "N/A") : (data?.bookAuthor.split(" :: ")[0] ?? "N/A")}
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

/**
 * Renders book metadata as a plain SVG element for inclusion in downloaded images.
 */
export const MetadataSvg = ({ id, data, svgWidth, marginLeft = 0 }) => {
  if (!data || !svgWidth) return null;

  const isManuscript = !data?.bookTitle;
  const fontSize = 11;
  const lineHeight = fontSize * 1.6;
  const svgHeight = lineHeight * 2 + 8;

  const fields = [
    { label: 'Version Code', value: data?.versionCode ?? 'N/A' },
    {
      label: isManuscript ? 'Shelfmark' : 'Book Title',
      value: isManuscript ? (data?.shelfmark.split(" :: ")[0] ?? 'N/A') : (data?.bookTitle?.label.split(" :: ")[0] ?? 'N/A'),
    },
    {
      label: isManuscript ? 'Manuscript Holding' : 'Book Author',
      value: isManuscript ? (data?.manuscriptHolding.split(" :: ")[0] ?? 'N/A') : (data?.bookAuthor.split(" :: ")[0] ?? 'N/A'),
    },
    ...(!isManuscript && data?.bookTitle?.path
      ? [{ label: 'Death Date', value: `${parseInt(data.bookTitle.path.slice(0, 4))} AH` }]
      : []),
    {
      label: 'Word Count',
      value: data?.wordCount
        ? `${data.wordCount.toLocaleString()} (${Math.ceil(data.wordCount / 300)} ms)`
        : 'N/A',
    },
  ];

  const colWidth = (svgWidth - marginLeft) / fields.length;

  return (
    <svg id={id} width={svgWidth} height={svgHeight}
      style={{ display: 'block', fontFamily: 'Arial' }}>
      {fields.map((f, i) => (
        <g key={i} transform={`translate(${marginLeft + i * colWidth}, 4)`}>
          <text y={fontSize}
            style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', fill: '#333' }}>
            {f.label}
          </text>
          <text y={fontSize + lineHeight}
            style={{ fontSize: `${fontSize}px`, fill: '#555' }}>
            {f.value}
          </text>
        </g>
      ))}
    </svg>
  );
};
