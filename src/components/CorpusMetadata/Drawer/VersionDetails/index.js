import { Box, Tooltip, Typography } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Link } from "react-router-dom";
import { displayNamesVersion } from "../ColumnDisplayName";
import CopyToClipboard from "../../../Common/CopyToClipboard";

const VersionDetails = ({ fullData }) => {
  // function for set color of the annotation status
  const getColored = (value) => {
    if (value === "(not yet annotated)") {
      return "conic-gradient(grey 360deg, #d1d5db 0deg)";
    } else if (value === "inProgress") {
      return "conic-gradient(#2863A5 90deg, #d1d5db 0deg)";
    } else if (value === "completed") {
      return "conic-gradient(#ea580c 180deg, #d1d5db 0deg)";
    } else if (value === "mARkdown") {
      return "conic-gradient(green 360deg, #d1d5db 0deg)";
    }
  };

  // organize table data
  const data = [
    {
      header: displayNamesVersion.version_id,
      body: fullData?.version_code,
    },
    {
      header: displayNamesVersion.version_uri,
      body: fullData?.version_uri,
      copy: true,
    },
    {
      header: displayNamesVersion.char_length,
      body: fullData?.release_version?.char_length,
    },
    {
      header: displayNamesVersion.tok_length,
      body: fullData?.release_version?.tok_length,
    },
    {
      header: displayNamesVersion.url,
      body: "GitHub URL",
      link: fullData?.release_version?.url,
    },
    {
      header: displayNamesVersion.version_lang,
      body: fullData?.language,
    },
    {
      header: displayNamesVersion.analysis_priority,
      body: (
        <Box display={"flex"} alignItems={"center"}>
          <FiberManualRecordIcon
            fontSize="small"
            color={fullData?.release_version?.analysis_priority}
            aria-label="Annotation Status"
          />
          {fullData?.release_version?.analysis_priority}
        </Box>
      ),
    },
    {
      header: displayNamesVersion.annotation_status,
      body: (
        <Tooltip
          sx={{ width: "max-content" }}
          title={fullData?.release_version?.annotation_status}
          arrow
        >
          <Box display={"flex"} alignItems={"center"}>
            <Box
              sx={{
                borderRadius: "50px",
                height: "16px",
                width: "16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mr: "5px",
              }}
              style={{
                background: getColored(
                  fullData?.release_version?.annotation_status
                ),
              }}
            ></Box>
            {fullData?.release_version?.annotation_status}
          </Box>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }} size="small" aria-label="a dense table">
      <Box>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              {item.header}
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
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
              {item.copy && <CopyToClipboard data={item.body} />}
            </Box>
          </Box>
        ))}
        <Box mt="30px">
          <Typography variant="h5">Edition Info</Typography>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              Editor
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
              {fullData?.edition?.editor ? fullData?.edition?.editor : "N/A"}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              Publisher
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
              {fullData?.edition?.publisher
                ? fullData?.edition?.publisher
                : "N/A"}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              Edition Place
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
              {fullData?.edition?.edition_place
                ? fullData?.edition?.edition_place
                : "N/A"}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              Edition Date
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
              {fullData?.edition?.edition_date
                ? fullData?.edition?.edition_date
                : "N/A"}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box margin={"5px 0px"} width={"20%"}>
              PDF URL
            </Box>
            <Box
              margin={"5px 0px"}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                width: "75%",
              }}
            >
              {fullData?.edition?.pdf_url ? (
                <Link
                  to={fullData?.edition?.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  {fullData?.edition?.pdf_url}
                </Link>
              ) : (
                "N/A"
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VersionDetails;
