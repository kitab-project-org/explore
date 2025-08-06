import { useState } from "react";
import { Box, IconButton, MenuItem, Tooltip } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PestControlIcon from "@mui/icons-material/PestControl";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

const GtihubActions = ({ versionURI }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  // github action icons data
  const data = [
    {
      title: "Change URI",
      icon: <SyncAltIcon fontSize="20" />,
      link: `https://github.com/OpenITI/Annotation/issues/new?assignees=&labels=URI+change+suggestion&template=change-uri.md&title=${versionURI}`,
    },
    {
      title: "Full text quality issue",
      icon: <PestControlIcon fontSize="20" />,
      link: `https://github.com/OpenITI/Annotation/issues/new?assignees=&labels=text+quality&template=text-quality-issue-.md&title=${versionURI}`,
    },
    {
      title: "Resport text tagged",
      icon: <LocalOfferIcon fontSize="20" />,
      link: `https://github.com/OpenITI/Annotation/issues/new?assignees=&labels=text+tagged&template=submission-report--for-pull-requests-.md&title=${versionURI}`,
    },
    {
      title: "Report text in progress",
      icon: <FormatListBulletedIcon fontSize="20" />,
      link: `https://github.com/OpenITI/Annotation/issues/new?assignees=&labels=in+progress&template=in-progress.md&title=IN+PROGRESS: ${versionURI}`,
    },
    {
      title: "Request change of primary text",
      icon: <AutorenewIcon fontSize="20" />,
      link: `https://github.com/OpenITI/Annotation/issues/new?assignees=&labels=PRI+%2526+SEC+Versions&template=pri-vs-sec.md&title=${versionURI}`,
    },
  ];

  return (
    <>
      <Tooltip title="GitHub">
        <IconButton
          onClick={() => {
            setOpenDropdown(true);
          }}
          size={"small"}
          color={"neutral"}
        >
          <GitHubIcon />
          {openDropdown ? (
            <Box
              sx={{
                position: "absolute",
                bgcolor: "white",
                top: "100%",
                left: "0px",
                right: {
                  xs: "0px",
                  sm: "auto",
                },
                zIndex: "99999",
                boxShadow: "0px 0px 5px 0px grey",
                display: "flex",
                width: "max-content",
              }}
            >
              {data.map((item, index) => (
                <Tooltip title={item.title} placement="top" key={index}>
                  <a rel="noreferrer" target="_blank" href={item.link}>
                    <MenuItem
                      sx={{
                        height: "30px",
                        width: "30px",
                        display: "flex",
                        justifyContent: "center",
                        justifyItems: "center",
                        color: "#7593af !important",
                      }}
                    >
                      {item.icon}
                    </MenuItem>
                  </a>
                </Tooltip>
              ))}
            </Box>
          ) : (
            ""
          )}
        </IconButton>
      </Tooltip>
      {openDropdown && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            zIndex: "9999",
          }}
          onClick={() => {
            setOpenDropdown(false);
          }}
        ></Box>
      )}
    </>
  );
};

export default GtihubActions;
