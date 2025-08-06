import { useContext } from "react";
import { Box, Stack, TableCell, Typography } from "@mui/material";
import { Context } from "../../../../App";

const BookTitleCell = ({ row, classes }) => {
  const { toggleSidePanel } = useContext(Context);
  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "30%",
        },
        display: {
          xs: "flex",
          md: "block",
        },
        justifyContent: "space-between",
        alignItems: "center",
        border: "none",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={0}>
        <Box
          display={"flex"}
          alignItems={"center"}
          gap={1}
          variant="body2"
          my={0}
        >
          <Typography
            color={"#2863A5"}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              toggleSidePanel(
                {
                  version_id: row?.version_code,
                  release_code: row?.release_version?.release_code,
                },
                1
              );
            }}
          >
            {row?.text?.title_lat_prefered}
          </Typography>
        </Box>
        <Typography variant="body2" my={0}>
          {row?.text?.title_ar_prefered}
        </Typography>
      </Stack>
      <Typography
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        Title
      </Typography>
    </TableCell>
  );
};

export default BookTitleCell;
