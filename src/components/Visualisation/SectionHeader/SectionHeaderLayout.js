import { useContext } from "react";
import { Box, Typography } from "@mui/material";
//import ToggleButton from "./ToggleButton";
import BAExtra from "./BookAlignmentHeader/BAExtra";
import DownloadPanel from "./VisualizationHeader/DownloadPanel";
import { Context } from "../../../App";

const SectionHeaderLayout = ({ item, children, toggle, setToggle, mb = "20px", showDownloadOptions = false, includeURL = false, setIncludeURL }) => {
  const {
    showOptions,
    isFlipped,
    releaseCode,
    metaData,
  } = useContext(Context);
  return (
    <Box mb={mb}>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        gap={"0px"}
        sx={{
          alignItems: "center",
          height: "60px",
          px: {
            xs: "10px",
            sm: "25px",
          },
          gap: "10px",
          bgcolor: "#F0F0F5",
          borderRadius: "5px",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "2px",
            width: "max-content",
          }}
        >
          {item.icon !== "" && (
            <i className={item.icon} style={{ width: "25px" }} />
          )}
          <Typography textTransform={"none"} color={"black"}>
            {item.title}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        {/*<Box display="flex" alignItems="center" justifyContent="flex-end">
          <ToggleButton setToggle={setToggle} toggle={toggle} />
        </Box>*/}
      </Box>
      {item.title === "Books" && showOptions && <BAExtra />}
      {item.title === "Pairwise Visualization" && (
        <Box sx={{ display: showDownloadOptions ? "block" : "none" }}>
          <DownloadPanel
            isPairwiseViz={true}
            downloadFileName={
              isFlipped
                ? `KITAB_explore_${releaseCode}_${metaData?.book2?.versionCode}_${metaData?.book1?.versionCode}.png`
                : `KITAB_explore_${releaseCode}_${metaData?.book1?.versionCode}_${metaData?.book2?.versionCode}.png`
            }
            includeURL={includeURL}
            setIncludeURL={setIncludeURL}
          />
        </Box>
      )}
      {item.title === "One-to-Many Visualization" && (
        <Box sx={{ display: showDownloadOptions ? "block" : "none" }}>
          <DownloadPanel
            isPairwiseViz={false}
            downloadFileName={`KITAB_explore_${releaseCode}_${metaData?.book1?.versionCode}_all.png`}
            includeURL={includeURL}
            setIncludeURL={setIncludeURL}
          />
        </Box>
      )}
    </Box>
  );
};

export default SectionHeaderLayout;
