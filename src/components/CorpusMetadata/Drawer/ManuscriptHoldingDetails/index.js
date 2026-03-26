import { Box, Typography } from "@mui/material";

const ManuscriptHoldingDetails = ({ fullData }) => {
  const holding = fullData?.manuscript?.manuscript_holding;

  if (!holding) {
    return <Typography>No holding information available.</Typography>;
  }

  const holdingName = Object.values(holding.names ?? {})[0];
  const country =
    Object.values(holding.country?.display_names ?? {})[0] ??
    holding.country?.country_code;
  const city =
    Object.values(holding.city?.display_names ?? {})[0] ??
    holding.city?.code;

  const rows = [
    { label: "Location URI", value: holding.loc_uri },
    { label: "Name", value: holdingName },
    { label: "Country", value: country },
    { label: "City", value: city },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {rows.map(({ label, value }) =>
        value ? (
          <Box
            key={label}
            sx={{
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
              "&:last-child": { borderBottom: "0px" },
            }}
          >
            <Box sx={{ width: "25%", margin: "5px 0px" }}>{label}</Box>
            <Box sx={{ width: "75%", margin: "5px 0px" }}>{value}</Box>
          </Box>
        ) : null
      )}
    </Box>
  );
};

export default ManuscriptHoldingDetails;
