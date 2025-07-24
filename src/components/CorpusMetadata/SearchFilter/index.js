import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FilterClose from "@mui/icons-material/FilterListOff";
import FilterOpen from "@mui/icons-material/FilterList";
import SetSearchField from "./SetSearchField";
import { Context } from "../../../App";
import AdvanceSearch from "./AdvanceSearch";
import { Button } from "@mui/material";
import { cleanSearchPagination } from "../../../utility/Helper"

const SearchFilters = ({ handleResetFilters, getQuery }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setFilterPanel, showFilters, searchField, setAdvanceSearch } =
    useContext(Context);
  const [text, setText] = useState("");

  // filter toggler
  const handleFilterPanel = () => {
    setFilterPanel(!showFilters);
  };

  // change search query
  const handleSearch = (e) => {
    e.preventDefault();
    // remove the page parameter from the query string
    const params = cleanSearchPagination(searchParams);
    if (text) {
      setSearchParams({ ...params, search: text });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  // clear addvance search filter query
  const clearAllAdvanceSearchFilter = () => {
    setAdvanceSearch({
      max_tok_count: "",
      min_tok_count: "",
      editor: "",
      edition_place: "",
      publisher: "",
      edition_date: "",
      died_before_AH: "",
      died_after_AH: "",
    });
    searchParams.delete("max_tok_count");
    searchParams.delete("min_tok_count");
    searchParams.delete("editor");
    searchParams.delete("edition_place");
    searchParams.delete("publisher");
    searchParams.delete("edition_date");
    searchParams.delete("died_before_AH");
    searchParams.delete("died_after_AH");
    setSearchParams(searchParams);
  };

  // search query function
  const getSearchQuery = useCallback(() => {
    const delaySearch = setTimeout(() => {
      if (searchParams.get("search")) {
        getQuery(searchParams.get("search"));
      } else {
        getQuery("");
      }
    }, 100);

    return () => clearTimeout(delaySearch);
  }, [getQuery, searchParams]);

  useEffect(() => {
    getSearchQuery();
  }, [getSearchQuery]);

  const [advanceParams, setAdvanceParams] = useState([]);

  useEffect(() => {
    const isExist = (item) => {
      const exists = advanceParams.filter((value) => {
        return value === item;
      });
      if (exists.length === 0) {
        return true;
      } else {
        return false;
      }
    };

    const paramMappings = {
      max_tok_count: "Maximum Token Count",
      min_tok_count: "Minimum Token Count",
      editor: "Editor",
      edition_place: "Edition Place",
      publisher: "Publisher",
      edition_date: "Edition Date", // Assuming this was intended
      died_before_AH: "Died Before",
      died_after_AH: "Died After",
    };

    const arr = [
      "max_tok_count",
      "min_tok_count",
      "editor",
      "edition_place",
      "publisher",
      "edition_date",
      "died_before_AH",
      "died_after_AH",
    ];

    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (searchParams.has(arr[i]) && isExist(Object.keys(paramMappings)[i])) {
        newArr = [...newArr, paramMappings[arr[i]]];
      }
    }
    setAdvanceParams(newArr);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateText = useCallback(() => {
    if (searchParams.has("search")) {
      setText(searchParams.get("search"));
    } else {
      setText("");
    }
  }, [searchParams]);

  const clearSearch = (e) => {
    e.preventDefault();
    setText("");
    getQuery("");
    searchParams.delete("search");
    searchParams.delete("search_by");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    updateText();
  }, [updateText]);

  return (
    <Box display={"flex"} justifyContent={"space-between"} gap={2} my={2}>
      <Grid container item md={12} xs={12}>
        <AdvanceSearch />
        <SetSearchField />
        <Grid
          display={"flex"}
          item
          xs={12}
          md={1}
          sx={{
            position: {
              xs: "fixed",
              sm: "relative",
            },
            top: {
              xs: "10px",
              sm: "inherit",
            },
            right: "0px",
          }}
        >
          <>
            <Tooltip title="Toggle Filter Sidebar">
              <IconButton
                onClick={handleFilterPanel}
                sx={{
                  display: "flex",
                }}
              >
                {showFilters ? <FilterClose /> : <FilterOpen />}
              </IconButton>
            </Tooltip>
          </>

          {searchParams.size ? (
            <Tooltip title="Clear Filters">
              <IconButton onClick={handleResetFilters}>
                <FilterAltOffIcon />
              </IconButton>
            </Tooltip>
          ) : (
            ""
          )}
        </Grid>
        <Grid display={"flex"} item xs={12} md={11}>
          <Grid flexGrow={1} className="Search" position={"relative"}>
            <Box>
              <form onSubmit={(e) => handleSearch(e)}>
                <TextField
                  id="outlined-search"
                  label={
                    searchField
                      ? searchField === "author"
                        ? "Search by author"
                        : "Search by title"
                      : "Search by author, title or attributes"
                  }
                  type="search"
                  size="small"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  fullWidth={true}
                />
              </form>
              {advanceParams.length !== 0 && (
                <Box
                  sx={{
                    width: "100%",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body1">Advanced Search:</Typography>
                  {advanceParams &&
                    advanceParams.map((item, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ ml: "4px", color: "#2863A5" }}
                      >
                        {item}
                        {advanceParams.length === i + 1 ? "" : ", "}
                      </Typography>
                    ))}
                  <Button
                    sx={{ color: "red" }}
                    onClick={clearAllAdvanceSearchFilter}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
              {(searchParams.get("search") || text || searchField) && (
                <Typography
                  sx={{
                    cursor: "pointer",
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    right: "15px",
                    mt: "2.5px",
                  }}
                  onClick={(e) => clearSearch(e)}
                >
                  <i className="fa-regular fa-circle-xmark"></i>
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchFilters;
