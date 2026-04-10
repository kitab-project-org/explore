import { useContext, useEffect, useState } from "react";
import { 
  AppBar, 
  Box,
  Drawer,
  IconButton, 
  Stack, 
  Tab,
  Tabs,
  Tooltip,
  Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppOutlinedIcon from "@mui/icons-material/GetAppOutlined";
import PropTypes from "prop-types";

import AuthorDetails from "./AuthorDetails";
import ManuscriptHoldingDetails from "./ManuscriptHoldingDetails";
import TextReuse from "./TextReuse";
import TextDetails from "./TextDetails";
import ManuscriptDetails from "./ManuscriptDetails";
import VersionDetails from "./VersionDetails";
import TextReuseTour from "../../GuidedTour/TextReuseTour";
import { getSidePanelData } from "../../../services/CorpusMetaData";
import { Context } from "../../../App";

export default function LeftSidePanel() {
  const {
    versionDetail,
    tabIndex,
    setTabIndex,
    isOpenDrawer,
    setIsOpenDrawer,
  } = useContext(Context);
  const [fullData, setFullData] = useState({});
  const [fullDataLoading, setFullDataLoading] = useState(false);
  const [textReuseTourRunning, setTextReuseTourRunning] = useState(false);

  // true when the drawer is showing a manuscript version rather than a text version
  const isManuscript = fullData?.manuscript != null;


  // download metadata function
  const handleDownloadJsonClick = () => {
    const link = document.createElement("a");
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullData)
    )}`;
    link.download = `version_details.json`;
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(clickEvt);
    link.remove();
  };

  // drawer tab change function
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSidePanelData(
        versionDetail?.release_code,
        versionDetail?.version_id
      );
      setFullData(data ? data : {});
    };
    if (isOpenDrawer) {
      // reset the fullData first:
      setFullData({});
      setFullDataLoading(true);
      fetchData();
      setFullDataLoading(false);
    }
  }, [versionDetail, isOpenDrawer]);

  return (
    <>
      <Drawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        anchor="right"
        ModalProps={{ keepMounted: true }}
      >
        <TextReuseTour run={textReuseTourRunning} onExit={() => setTextReuseTourRunning(false)} />
        {fullData && (
          <Box
            id="meta-drawer"
            sx={{
              width: {
                xl: "850px",
                md: "700px",
                sm: "100%",
              },
            }}
          >
            <AppBar position="sticky" color={"neutral"} heigth={"1vw"}>
              <Stack
                direction="row"
                justifyContent={"space-between"}
                p={1}
                color="notYetAnnotated"
              >
                <Stack spacing={2} direction={"row"}>
                  <Tooltip title={"Download this record in Json"} arrow>
                    <IconButton
                      onClick={handleDownloadJsonClick}
                      color={"iconColor"}
                      aria-label="Download this record in Json"
                    >
                      <GetAppOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography
                  variant="body1"
                  display={"flex"}
                  alignItems={"center"}
                >
                  {`Version - ${
                    fullData?.release_version?.release_code === "post-release"
                      ? "Post Release"
                      : fullData?.release_version?.release_code
                  }`}
                </Typography>
                <Stack direction={"row"}>
                  <Tooltip title={"Close"} arrow>
                    <IconButton
                      onClick={() => setIsOpenDrawer(false)}
                      color={"iconColor"}
                      aria-label="Close"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </AppBar>

            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Tabs
                  value={tabIndex}
                  onChange={handleChange}
                  aria-label="Full Record Details"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    label={isManuscript ? "Holding Details" : "Author Details"}
                    {...a11yProps(0)}
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  />
                  <Tab
                    label={isManuscript ? "Manuscript Details" : "Text Details"}
                    {...a11yProps(1)}
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  />
                  <Tab
                    label="Version Details"
                    {...a11yProps(2)}
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  />
                  <Tab
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        Text Reuse
                        <Tooltip title="Explain text reuse panel" arrow>
                          <span
                            id="text-reuse-drawer-info"
                            onClick={(e) => { e.stopPropagation(); setTextReuseTourRunning(true); }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              visibility: tabIndex === 3 ? "visible" : "hidden",
                              pointerEvents: tabIndex === 3 ? "auto" : "none",
                            }}
                          >
                            <i className="fa-solid fa-circle-info" style={{ fontSize: "14px" }} />
                          </span>
                        </Tooltip>
                      </Box>
                    }
                    {...a11yProps(4)}
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  />
                </Tabs>
              </Box>
              <TabPanel value={tabIndex} index={0}>
                {fullData && !isManuscript && <AuthorDetails fullData={fullData} />}
                {fullData && isManuscript && <ManuscriptHoldingDetails fullData={fullData} />}
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                {fullData && !isManuscript && <TextDetails fullData={fullData} />}
                {fullData && isManuscript && <ManuscriptDetails fullData={fullData} />}
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                {fullData && <VersionDetails fullData={fullData} />}
              </TabPanel>
              <TabPanel value={tabIndex} index={3}>
                {fullData && <TextReuse fullData={fullData} fullDataLoading={fullDataLoading}/>}
              </TabPanel>
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
}
