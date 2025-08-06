import { Typography, TableCell } from "@mui/material";

const CountToken = ({ classes, row }) => {
  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "10%",
        },
        border: "none",
        display: "flex",
        justifyContent: {
          xs: "space-between !important",
          md: "center !important",
        },
        boxSizing: "border-box",
      }}
    >
      <Typography>{row?.release_version?.tok_length}</Typography>
      <Typography
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        Token Count
      </Typography>
    </TableCell>
  );
};

export default CountToken;
