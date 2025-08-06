import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Drawer, Box, Typography } from "@mui/material";
import CustomTextInput from "./CustomTextInput";
import MultiSlider from "./MultiSlider";
import { Context } from "../../../../App";
import { cleanSearchPagination } from "../../../../utility/Helper"


const style = {
  p: {
    xs: "30px",
    md: "50px",
  },
  boxSizing: "border-box",
};

export default function AdvanceSearch() {
  const {
    advanceSearchModal,
    setAdvanceSearchModal,
    advanceSearch,
    setAdvanceSearch,
  } = useContext(Context);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tempAdvanceSearch, setTempAdvanceSearch] = useState({
    max_tok_count: "",
    min_tok_count: "",
    editor: "",
    edition_place: "",
    publisher: "",
    edition_date: "",
    died_before_AH: "",
    died_after_AH: "",
  });

  // handle advance searches

  const handleChangeAdvanceSearch = (event) => {
    setTempAdvanceSearch({
      ...tempAdvanceSearch,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeCommitted = (e, newVal) => {
    setTempAdvanceSearch({
      ...tempAdvanceSearch,
      max_tok_count: newVal[1],
      min_tok_count: newVal[0],
    });
  };

  const handleSubmitAdvanceSearch = () => {
    setAdvanceSearch(tempAdvanceSearch);
    // remove the page parameter from the query string
    const params = cleanSearchPagination(searchParams);
    const allSearchParams = {
      ...(params || {}),
      max_tok_count: tempAdvanceSearch?.max_tok_count,
      min_tok_count: tempAdvanceSearch?.min_tok_count,
      editor: tempAdvanceSearch?.editor,
      publisher: tempAdvanceSearch?.publisher,
      edition_date: tempAdvanceSearch?.edition_date,
      died_before_AH: tempAdvanceSearch?.died_before_AH,
      died_after_AH: tempAdvanceSearch?.died_after_AH,
    };

    // Remove properties with undefined or null values
    for (const key in allSearchParams) {
      if (
        allSearchParams[key] === "" ||
        allSearchParams[key] === 0 ||
        allSearchParams[key] === null
      ) {
        delete allSearchParams[key];
      }
    }

    setSearchParams(allSearchParams);
    setAdvanceSearchModal(false);
  };

  useEffect(() => {
    setAdvanceSearch({
      max_tok_count: searchParams.get("max_tok_count")
        ? searchParams.get("max_tok_count")
        : "",
      min_tok_count: searchParams.get("min_tok_count")
        ? searchParams.get("min_tok_count")
        : "",
      editor: searchParams.get("editor") ? searchParams.get("editor") : "",
      edition_place: searchParams.get("edition_place")
        ? searchParams.get("edition_place")
        : "",
      publisher: searchParams.get("publisher")
        ? searchParams.get("publisher")
        : "",
      edition_date: searchParams.get("edition_date")
        ? searchParams.get("edition_date")
        : "",
      died_before_AH: searchParams.get("died_before_AH")
        ? searchParams.get("died_before_AH")
        : "",
      died_after_AH: searchParams.get("died_after_AH")
        ? searchParams.get("died_after_AH")
        : "",
    });
  }, [searchParams, setAdvanceSearch]);

  return (
    <Drawer
      open={advanceSearchModal}
      onClose={() => setAdvanceSearchModal(false)}
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "400px",
          boxSizing: "border-box",
        },
      }}
      anchor="right"
    >
      <Box sx={style}>
        <Typography
          id="transition-modal-title"
          variant="h5"
          sx={{ mb: "20px" }}
        >
          Advanced Search
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", mt: "5px" }}>
          <MultiSlider
            min={advanceSearch?.min_tok_count}
            max={advanceSearch?.max_tok_count}
            handler={handleChangeCommitted}
            label={"Token Count:"}
          />
          <CustomTextInput
            label={"Author Died Before: "}
            value={tempAdvanceSearch.died_before_AH}
            handler={handleChangeAdvanceSearch}
            name={"died_before_AH"}
          />
          <CustomTextInput
            label={"Author Died After: "}
            value={tempAdvanceSearch.died_after_AH}
            handler={handleChangeAdvanceSearch}
            name={"died_after_AH"}
          />
          <CustomTextInput
            label={"Editor of the paper version:"}
            value={tempAdvanceSearch.editor}
            handler={handleChangeAdvanceSearch}
            name={"editor"}
          />
          <CustomTextInput
            label={"Place of the edition of the paper version:"}
            value={tempAdvanceSearch.edition_place}
            handler={handleChangeAdvanceSearch}
            name={"edition_place"}
          />
          <CustomTextInput
            label={"Publisher of the paper version:"}
            value={tempAdvanceSearch.publisher}
            handler={handleChangeAdvanceSearch}
            name={"publisher"}
          />
          <CustomTextInput
            label={"Edition date of the paper version:"}
            value={tempAdvanceSearch.edition_date}
            handler={handleChangeAdvanceSearch}
            name={"edition_date"}
          />
          <Box mt="10px" display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{ height: "48px", px: "50px" }}
              onClick={handleSubmitAdvanceSearch}
            >
              <Typography variant="body1" sx={{ textTransform: "none" }}>
                Search
              </Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
