import * as React from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

export default function AlertComponent({ forDrawer }) {
  return (
    <Box
      mx={"auto"}
      display={"flex"}
      flexDirection={"column"}
      sx={{
        width: {
          xs: "100%",
          xl: forDrawer ? "calc(100% + 48px)" : "1280px",
        },
        pt: "0px",
        pb: forDrawer ? "15px" : "0px",
        float: {
          xs: "left",
          sm: "inherit",
        },
        boxSizing: "border-box",
        position: "relative",
        mt: forDrawer ? "-24px" : "0px",
        ml: forDrawer ? "-24px" : null,
      }}
    >
      <Stack sx={{ width: "100%" }} spacing={2}>
        <Alert
          severity="warning"
          sx={{
            padding: {
              sm: "0px 20px",
              md: forDrawer ? "5px 10px" : "10px 100px",
            },
          }}
        >
          This is a test instance of the KITAB metadata portal. It contains only
          a sample of the text reuse statistics produced by the project. 
          If you do not find statistics for your pair of texts in the table below
          it does not necessarily mean that there is no data for that text pair. 
          A full data release will be coming soon. Check back with the{" "}
          <Link to={"https://kitab-project.org/"}>KITAB website </Link> for
          updates. For now, you can click the "Visualize all text reuse"
          button below to view all text reuse related to this text, 
          or select two texts in the catalogue using 
          the checkboxes and click the "pairwise visualisation" icon 
          at the top of the table to visualize the text reuse between them.
        </Alert>
      </Stack>
    </Box>
  );
}
