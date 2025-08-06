import { useContext } from "react";
import { Box, Stack, TableCell, Typography } from "@mui/material";
import { Context } from "../../../../App";

const AuthorCell = ({ row, classes }) => {
  const { toggleSidePanel } = useContext(Context);

  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "15%",
        },
        border: "none",
        display: {
          xs: "flex",
          md: "block",
        },
        justifyContent: "space-between",
        boxSizing: "border-box",
        alignItems: "center",
      }}
    >
      <Stack spacing={0}>
        <Box
          variant="body2"
          my={0}
          display={"flex"}
          alignItems={"center"}
          gap={1}
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
                0
              );
            }}
          >
            {row?.text.author[0]?.author_lat_prefered &&
              row?.text.author[0]?.author_lat_prefered}
          </Typography>
        </Box>
        <Typography variant="body2" my={0}>
          {row?.text.author[0]?.author_lat_prefered &&
            row?.text.author[0]?.author_ar_prefered}
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
        Author
      </Typography>
    </TableCell>
  );
};

export default AuthorCell;
