import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import { useContext } from "react";
import { Context } from "../../../App";
import { cleanSearchPagination } from "../../../utility/Helper"


function MetaFilters() {
  const { annotationFilter, setAnnotationFilter } = useContext(Context);
  const [searchParams, setSearchParams] = useSearchParams();

  const filterString = (value) => {
    let str = "";
    str = value?.notYetAnnotated ? str + "notYetAnnotated," : str;
    str = value?.inProgress ? str + "inProgress," : str;
    str = value?.completed ? str + "completed," : str;
    str = value?.mARkdown ? str + "mARkdown," : str;
    return str;
  };

  // change annotation filters
  const handleChange = (event) => {
    setAnnotationFilter({
      ...annotationFilter,
      [event.target.name]: event.target.checked,
    });
    const filters = filterString({
      ...annotationFilter,
      [event.target.name]: event.target.checked,
    });
    if (filters) {
      // remove the page parameter from the query string
      const params = cleanSearchPagination(searchParams);
      setSearchParams({ ...params, annotation_status: filters });
    } else {
      searchParams.delete("annotation_status");
      setSearchParams(searchParams);
    }
  };

  return (
    <>
      <FormControl my={0} fullWidth>
        <FormLabel
          sx={{
            py: "10px",
            fontWeight: "600",
            color: "rgba(0, 0, 0, 0.6) !important",
          }}
        >
          Annotation Status:
        </FormLabel>
        <Box display={"flex"} flexDirection={"column"} gap={1} mx={2}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <FormLabel
              sx={{
                color: "rgba(0, 0, 0, 0.6) !important",
              }}
            >
              Pending
            </FormLabel>
            <Switch
              size="small"
              checked={annotationFilter?.notYetAnnotated}
              onChange={handleChange}
              name={"notYetAnnotated"}
              color={"notYetAnnotated"}
            />
          </Box>

          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <FormLabel
              sx={{
                color: "rgba(0, 0, 0, 0.6) !important",
              }}
            >
              In Progress
            </FormLabel>
            <Switch
              size="small"
              checked={annotationFilter?.inProgress}
              onChange={handleChange}
              name={"inProgress"}
              color={"inProgress"}
            />
          </Box>

          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <FormLabel
              sx={{
                color: "rgba(0, 0, 0, 0.6) !important",
              }}
            >
              Completed
            </FormLabel>
            <Switch
              size="small"
              checked={annotationFilter?.completed}
              onChange={handleChange}
              name={"completed"}
              color={"completed"}
            />
          </Box>

          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <FormLabel
              sx={{
                color: "rgba(0, 0, 0, 0.6) !important",
              }}
            >
              Completed and Vetted
            </FormLabel>
            <Switch
              size="small"
              checked={annotationFilter?.mARkdown}
              onChange={handleChange}
              name={"mARkdown"}
              color={"mARkdown"}
            />
          </Box>
        </Box>
      </FormControl>
    </>
  );
}

export default MetaFilters;
