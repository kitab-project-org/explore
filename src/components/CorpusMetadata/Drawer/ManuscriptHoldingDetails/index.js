import { Box, Typography } from "@mui/material";

const ManuscriptHoldingDetails = ({ fullData }) => {
  const holding = fullData?.manuscript?.manuscript_holding;

  if (!holding) {
    return <Typography>No holding information available.</Typography>;
  }

  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  const holdingNames = unique(Object.values(holding.names ?? {}));
  const countryNames = unique([
    ...Object.values(holding.country?.display_names ?? {}),
    holding.country?.country_code,
  ]);
  const cityNames = unique([
    ...Object.values(holding.city?.display_names ?? {}),
    holding.city?.code,
  ]);

  const rows = [
    { label: "Location URI", value: unique([holding.loc_uri]) },
    { label: "Name", value: holdingNames },
    { label: "Country", value: countryNames },
    { label: "City", value: cityNames },
  ];

  return (
    <Box id="ManuscriptHoldingDetails" sx={{ width: "100%" }}>
      {rows.map(({ label, value }) =>
        value.length > 0 ? (
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
            <Box sx={{ width: "75%", margin: "5px 0px" }}>
              {value.map((v, i) => (
                <span key={i}>{v}{i < value.length - 1 && <br />}</span>
              ))}
            </Box>
          </Box>
        ) : null
      )}
    </Box>
  );
};

export default ManuscriptHoldingDetails;
