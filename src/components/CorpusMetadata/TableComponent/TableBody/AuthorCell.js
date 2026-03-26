import { useContext } from "react";
import { Box, Stack, TableCell, Typography } from "@mui/material";
import { Context } from "../../../../App";

const AuthorCell = ({ row, classes }) => {
  const { toggleSidePanel } = useContext(Context);

  const isManuscript = row.manuscript !== null;

  // for manuscripts: primary line = English holding name, secondary = Arabic;
  // for texts: Latin author name + Arabic author name as usual
  const holding = row.manuscript?.manuscript_holding;
  const holdingEn = holding?.names?.en ?? holding?.loc_uri;
  const holdingAr = holding?.names?.ar ?? "";
  
  const cityEn = holding?.city?.display_names?.en ?? "";
  const cityAr = holding?.city?.display_names?.ar ?? "";
  const primaryText = isManuscript
    ? [holdingEn, cityEn].filter(Boolean).join(", ") // add a comma only if both are present
    : row?.text?.author?.[0]?.author_lat_prefered ?? "";
  const secondaryText = isManuscript
    ? [holdingAr, cityAr].filter(Boolean).join("، ")
    : row?.text?.author?.[0]?.author_ar_prefered ?? "";

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
            {primaryText}
          </Typography>
        </Box>
        <Typography variant="body2" my={0}>
          {secondaryText}
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
