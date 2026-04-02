import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

const FIELDS = [
  { key: "shuhra", label: "Shuhra" },
  { key: "ism",    label: "Ism" },
  { key: "nasab",  label: "Nasab" },
  { key: "kunya",  label: "Kunya" },
  { key: "laqab",  label: "Laqab" },
  { key: "nisba",  label: "Nisba" },
];

const getLanguageLabel = (item) =>
  item.language === "AR" ? "Arabic" : "Transcription";

const border = "1px solid rgba(224, 224, 224, 1)";

export default function NameElementsTable({ data }) {
  const rows = (data ?? []).filter((item) =>
    FIELDS.some((f) => item[f.key])
  );

  if (rows.length === 0) return null;

  return (
    <>
      {/* Card layout for small screens */}
      <Box sx={{ display: { xs: "block", md: "none" }, mt: "3px" }}>
        {rows.map((item, i) => (
          <Box
            key={i}
            sx={{
              mb: 1,
              border,
              borderRadius: 1,
              p: 1,
            }}
          >
            <Typography variant="body2" fontWeight="bold" mb={0.5}>
              {getLanguageLabel(item)}
            </Typography>
            {FIELDS.filter((f) => item[f.key]).map((f) => (
              <Box key={f.key} sx={{ display: "flex", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ width: "40%", color: "text.secondary", flexShrink: 0 }}
                >
                  {f.label}:
                </Typography>
                <Typography variant="body2">{item[f.key]}</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* Table layout for larger screens */}
      <TableContainer
        component={Paper}
        sx={{ display: { xs: "none", md: "block" }, mt: "3px" }}
      >
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell align="left" sx={{ border }}>
                Language
              </TableCell>
              {FIELDS.map((f) => (
                <TableCell key={f.key} align="right" sx={{ border }}>
                  {f.label}
                </TableCell>
              ))}
            </TableRow>
            {rows.map((item, i) => (
              <TableRow key={i}>
                <TableCell scope="row" align="left" sx={{ border }}>
                  {getLanguageLabel(item)}
                </TableCell>
                {FIELDS.map((f) => (
                  <TableCell key={f.key} scope="row" align="right" sx={{ border }}>
                    {item[f.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
