import {
  Box,
  Divider,
  Stack,
  TableCell,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { downloadGitHubRawFile } from "./MoreCell";
import { Context } from "../../../../App";
import CopyToClipboard from "../../../Common/CopyToClipboard";

const VersionIdCell = ({ row, classes }) => {
  const { toggleSidePanel } = useContext(Context);
  let versionUrl = row?.release_version?.url;
  let versionUri = versionUrl.split("/")[versionUrl.split("/").length - 1];

  // get colors for annotation status
  const getColored = () => {
    if (row?.release_version?.annotation_status === "(not yet annotated)") {
      return "conic-gradient(grey 360deg, #d1d5db 0deg)";
    } else if (row?.release_version?.annotation_status === "inProgress") {
      return "conic-gradient(#2863A5 90deg, #d1d5db 0deg)";
    } else if (row?.release_version?.annotation_status === "completed") {
      return "conic-gradient(#ea580c 180deg, #d1d5db 0deg)";
    } else if (row?.release_version?.annotation_status === "mARkdown") {
      return "conic-gradient(green 360deg, #d1d5db 0deg)";
    }
  };

  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "15%",
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

        <Stack
          direction={"row"}
          spacing={1}
          divider={<Divider orientation="vertical" flexItem />}
          alignItems={"center"}
        >
          <Tooltip
            placement="top"
            title="Warning: This is not the best version of the book! Choose another version unless you really want this one."
          >
            <Box sx={{ pl: 1 }}>
              {row?.release_version?.analysis_priority === "pri" ? (
                ""
              ) : (
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
              sx={{
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <Typography color={"#2863A5"}>
                <i className="fa-solid fa-cloud-arrow-down"></i>
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title={row?.release_version?.annotation_status}>
            <Box
              sx={{
                borderRadius: "50px",
                height: "16px",
                width: "16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              style={{
                background: getColored(row?.release_version?.annotation_status),
              }}
            ></Box>
          </Tooltip>
          <CopyToClipboard data={versionUri} />
        </Stack>
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
