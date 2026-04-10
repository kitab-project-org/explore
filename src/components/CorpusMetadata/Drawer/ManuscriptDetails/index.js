import { Box, Typography } from "@mui/material";

const ManuscriptDetails = ({ fullData }) => {
  const manuscript = fullData?.manuscript;

  if (!manuscript) {
    return <Typography>No manuscript information available.</Typography>;
  }

  const metaRows = [
    { label: "Manuscript URI", value: manuscript.manuscript_uri },
    { label: "Shelfmark", value: manuscript.shelfmark },
    { label: "Tags", value: manuscript.tags },
    { label: "Bibliography", value: manuscript.bibliography },
    { label: "Notes", value: manuscript.notes },
  ];

  return (
    <Box id="ManuscriptDetails" sx={{ width: "100%" }}>
      {/* Key metadata rows */}
      {metaRows.map(({ label, value }) =>
        value ? (
          <Box
            key={label}
            sx={{
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box sx={{ width: "25%", margin: "5px 0px" }}>{label}</Box>
            <Box sx={{ width: "75%", margin: "5px 0px" }}>{value}</Box>
          </Box>
        ) : null
      )}

      {/* Titles list */}
      {manuscript.titles?.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Titles
          </Typography>
          {manuscript.titles.map((t, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                margin: "5px 0px",
                borderBottom: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Box sx={{ width: "25%", margin: "5px 0px" }}>
                {t.language?.toUpperCase()}
                {t.is_preferred ? " (preferred)" : ""}
              </Box>
              <Box sx={{ width: "75%", margin: "5px 0px" }}>{t.title}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ManuscriptDetails;
