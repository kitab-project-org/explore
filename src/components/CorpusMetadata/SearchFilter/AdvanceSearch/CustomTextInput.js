import { Box, TextField } from "@mui/material";

export default function CustomTextInput({ label, value, handler, name }) {
  return (
    <Box sx={{ py: "10px" }}>
      <TextField
        name={name}
        id="outlined-basic"
        label={label}
        variant="outlined"
        sx={{ width: "100%" }}
        value={value}
        onChange={handler}
      />
    </Box>
  );
}
