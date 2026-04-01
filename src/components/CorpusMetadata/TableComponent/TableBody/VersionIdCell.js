import {
  Box,
  Chip,
  Stack,
  TableCell,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { downloadGitHubRawFile } from "./MoreCell";
import GitHubActions from "./GithubActions";
import { Context } from "../../../../App";
import CopyToClipboard from "../../../Common/CopyToClipboard";

const VersionIdCell = ({ row, classes }) => {
  const { toggleSidePanel, allReleasesInsights } = useContext(Context);
  const allLanguages = allReleasesInsights.reduce(
    (acc, r) => ({ ...acc, ...(r.languages ?? {}) }),
    {}
  );
  let versionUrl = row?.release_version?.url;
  let versionUri = versionUrl.split("/")[versionUrl.split("/").length - 1];
  const languages = row?.language
    ? row.language.split(",").map(l => l.trim()).filter(Boolean)
    : [];

  const annotationIcons = {
    "(not yet annotated)": { icon: "fa-regular fa-circle", color: "#d1d5db" },
    inProgress:            { icon: "fa-solid fa-spinner",      color: "#ea580c" },
    completed:             { icon: "fa-solid fa-circle",       color: "green" },
    mARkdown:              { icon: "fa-solid fa-circle-check", color: "green" },
  };
  const annotationIcon = annotationIcons[row?.release_version?.annotation_status];

  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "18%",
        },
        border: "none",
        display: {
          xs: "flex",
          md: "block",
        },
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={"2px"}>
        <Typography
          color={"#2863A5"}
          sx={{ cursor: "pointer" }}
          onClick={() => {
            toggleSidePanel(
              {
                version_id: row?.version_code,
                release_code: row?.release_version?.release_code,
              },
              2
            );
          }}
          pr={1}
        >
          {row?.version_code}
        </Typography>

        {/* Row 1: action icons */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
          <Tooltip
            placement="top"
            title="Warning: This is not the best version of the book! Choose another version unless you really want this one."
          >
            <Box>
              {row?.release_version?.analysis_priority !== "pri" && (
                <i
                  className="fa-solid fa-triangle-exclamation"
                  style={{ color: "#eab308" }}
                ></i>
              )}
            </Box>
          </Tooltip>
          <Tooltip placement="top" title={row?.release_version?.url}>
            <Box
              onClick={() => downloadGitHubRawFile(row)}
              sx={{ color: "#94a3b8", cursor: "pointer" }}
            >
              <Typography color={"#2863A5"}>
                <i className="fa-solid fa-cloud-arrow-down"></i>
              </Typography>
            </Box>
          </Tooltip>
          <CopyToClipboard data={versionUri} />
          <GitHubActions versionURI={row?.version_uri} />
        </Box>

        {/* Row 2: information icons */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
          <Tooltip title={row?.release_version?.annotation_status}>
            <Box display="flex" alignItems="center">
              {annotationIcon && (
                <i
                  className={annotationIcon.icon}
                  style={{ color: annotationIcon.color, fontSize: "16px" }}
                />
              )}
            </Box>
          </Tooltip>
          {languages.length > 0 && (
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {languages.map(lang => (
                <Tooltip key={lang} title={allLanguages[lang] ?? lang} arrow>
                  <Chip
                    label={lang}
                    size="small"
                    variant="outlined"
                    sx={{ height: "20px", fontSize: "15px", borderRadius: "4px" }}
                  />
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>
      </Stack>
      <Typography
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        Version
      </Typography>
    </TableCell>
  );
};

export default VersionIdCell;
