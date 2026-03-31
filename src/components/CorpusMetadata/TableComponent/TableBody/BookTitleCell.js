import { useContext } from "react";
import { Box, Stack, TableCell, Typography } from "@mui/material";
import { Context } from "../../../../App";

const BookTitleCell = ({ row, classes }) => {
  const { toggleSidePanel } = useContext(Context);

  const isManuscript = row.manuscript !== null;

  // for manuscripts: primary line = shelfmark, secondary lines = all titles;
  // for texts: Latin title + Arabic title as usual
  const primaryText = isManuscript
    ? row.manuscript?.shelfmark
    : row?.text?.title_lat_prefered;
  const secondaryText = isManuscript ? null : row?.text?.title_ar_prefered;
  const manuscriptTitles = isManuscript ? (row.manuscript?.titles ?? []) : [];

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
            {primaryText}
          </Typography>
        </Box>
        {secondaryText && (
          <Typography variant="body2" my={0}>
            {secondaryText}
          </Typography>
        )}
        {manuscriptTitles.map((t, i) => (
          <Typography key={i} variant="body2" my={0}>
            {t.title}
          </Typography>
        ))}
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
