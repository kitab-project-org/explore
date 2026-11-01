import { Box, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";

const StatMetricFilter = ({ statMetric, setStatMetric }) => (
  <Box sx={{ px: "20px", py: "8px" }}>
    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Display metric:</Typography>
    <RadioGroup
      value={statMetric}
      onChange={(e) => setStatMetric(e.target.value)}
    >
      <FormControlLabel
        value="alignments"
        control={<Radio size="small" />}
        label={<Typography variant="body2">Number of alignments</Typography>}
        sx={{ my: 0 }}
      />
      <FormControlLabel
        value="characters"
        control={<Radio size="small" />}
        label={<Typography variant="body2">Characters matched</Typography>}
        sx={{ my: 0 }}
      />
    </RadioGroup>
  </Box>
);

export default StatMetricFilter;
