import { useState } from "react";
import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { exampleValues } from "./exampleValues";

const DiffViewerComponent = () => {
  const [inputValues, setInputValues] = useState({
    s1: "",
    s2: "",
  });

  const handleChangeInput = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  };

  const loadExampleValues = () => {
    setInputValues({
      s1: exampleValues.inputA,
      s2: exampleValues.inputB,
    });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        px: {
          md: "50px",
          lg: "100px",
          xl: "300px",
        },
      }}
      py={"50px"}
      pt={"70px"}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mb={"20px"}
      >
        <Typography variant="h4">Diff Viewer</Typography>
        <Typography>
          View code on{" "}
          <Link
            href="https://github.com/kitab-project-org/diffViewer"
            target="_blank"
          >
            GitHub
          </Link>
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ width: "70%" }}>
        Paste the two strings you want to compare in the fields below (or{" "}
        <Link onClick={loadExampleValues} sx={{ cursor: "pointer" }}>
          load an example
        </Link>
        ) and click the display button. You can also upload a csv file using the
        "Upload from file" button.
      </Typography>

      <Box display={"flex"} alignItems={"center"} mt={"20px"}>
        <Button variant="outlined" sx={{ mr: 2 }}>
          Display Diff
        </Button>
        <Button
          variant="outlined"
          sx={{ mr: 2 }}
          onClick={() =>
            setInputValues({
              s1: "",
              s2: "",
            })
          }
        >
          Clear
        </Button>
        <Button variant="outlined" sx={{ mr: 2 }}>
          Upload From File
        </Button>
        <Button variant="outlined" sx={{ mr: 2 }}>
          Options
        </Button>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="50px">
        <Box width="48%">
          <TextField
            multiline
            rows={12}
            name="s1"
            onChange={handleChangeInput}
            value={inputValues.s1}
            className="leftScrollbar"
            sx={{
              width: "100%",
            }}
            inputProps={{
              style: {
                fontSize: "20px",
                textAlign: "right",
                overflowX: "hidden",
                lineHeight: "30px",
              },
            }}
          />
        </Box>
        <Box width="48%" dir="rtl">
          <TextField
            multiline
            rows={12}
            name="s2"
            onChange={handleChangeInput}
            value={inputValues.s2}
            sx={{
              width: "100%",
            }}
            inputProps={{
              style: {
                fontSize: "20px",
                overflowX: "hidden",
                lineHeight: "30px",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DiffViewerComponent;
