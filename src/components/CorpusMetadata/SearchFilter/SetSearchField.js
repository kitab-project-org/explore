import * as React from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Tooltip,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Box } from "@mui/material";
import { Checkbox } from "@mui/material";
import { Context } from "../../../App";
import { Button } from "@mui/material";
import { Typography } from "@mui/material";
import { cleanSearchPagination } from "../../../utility/Helper"


export default function SetSearchField() {
  const {
    searchField,
    setSearchField,
    normalizedSearch,
    setNormalizedSearch,
    advanceSearchModal,
    setAdvanceSearchModal,
  } = React.useContext(Context);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearchField = (e) => {
    if (e.target.value) {
      setSearchField(e.target.value);
      // remove the page parameter from the query string
      const params = cleanSearchPagination(searchParams);
      setSearchParams({ ...params, search_by: e.target.value });
    } else {
      setSearchField("");
      searchParams.delete("search_by");
      setSearchParams(searchParams);
    }
  };

  const handleNormalize = (e) => {
    e.preventDefault();
    if (normalizedSearch) {
      setNormalizedSearch(false);
      // remove the page parameter from the query string
      const params = cleanSearchPagination(searchParams);
      setSearchParams({ ...params, normalize: false });
    } else {
      setNormalizedSearch(true);
      // remove the page parameter from the query string
      const params = cleanSearchPagination(searchParams);
      setSearchParams({ ...params, normalize: true });
    }
  };

  useEffect(() => {
    if (searchParams.has("search_by")) {
      setSearchField(searchParams.get("search_by"));
    } else {
      setSearchField("");
    }
  }, [searchParams, setSearchField]);

  useEffect(() => {
    if (searchParams.has("normalize")) {
      setNormalizedSearch(
        searchParams.get("normalize") === "true" ? true : false
      );
    }
  }, [searchParams, setNormalizedSearch]);

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="flex-center"
      width="100%"
      mb="20px"
      sx={{
        textTransform: "none",
        flexDirection: {
          xs: "column",
          md: "row",
        },
      }}
    >
      <Tooltip title="Normalize search terms (Arabic+translation) to find more results">
        <FormControl>
          <FormControlLabel
            onChange={handleNormalize}
            control={
              <Checkbox
                checked={normalizedSearch}
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },
                }}
              />
            }
            label="Normalize Search Terms"
            sx={{
              "& .MuiTypography-root": {
                fontSize: 14,
                userSelect: "none",
              },
              display: "flex",
              justifyContent: "flex-start",
            }}
          />
        </FormControl>
      </Tooltip>
      <FormControl sx={{ width: "max-content" }}>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={handleSearchField}
          value={searchField}
        >
          <FormControlLabel
            value="author"
            sx={{
              "& .MuiTypography-root": {
                fontSize: 14,
                userSelect: "none",
              },
            }}
            control={
              <Radio
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },
                }}
              />
            }
            label="Search By Author"
          />
          <FormControlLabel
            value="title"
            control={
              <Radio
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },
                }}
              />
            }
            label="Search By Book Title"
            sx={{
              "& .MuiTypography-root": {
                fontSize: 14,
                userSelect: "none",
              },
            }}
          />
        </RadioGroup>
      </FormControl>
      <Button
        variant="contained"
        sx={{
          fontSize: 14,
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => setAdvanceSearchModal(!advanceSearchModal)}
      >
        <i
          className="fa-brands fa-searchengin"
          style={{ marginRight: "5px" }}
        ></i>{" "}
        <Typography sx={{ fontSize: 14, textTransform: "none" }}>
          Advanced Search
        </Typography>
      </Button>
    </Box>
  );
}
