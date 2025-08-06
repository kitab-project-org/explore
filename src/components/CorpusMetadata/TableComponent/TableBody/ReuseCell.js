import { useContext } from "react";
import { Box, TableCell, Tooltip, Link, Typography } from "@mui/material";
import { Context } from "../../../../App";
import { oneToAllFolders } from "../../../../assets/srtFolders";
import { REPO_NAME } from "../../../Common/NavigationBar";

const ReuseCell = ({ classes, row }) => {
  const { toggleSidePanel, releaseCode } = useContext(Context);

  return (
    <TableCell
      className={classes.tableCell}
      sx={{
        width: {
          xs: "100%",
          md: "10%",
        },
        border: "none",
        display: "flex",
        justifyContent: {
          xs: "space-between",
          md: "flex-end !important",
        },
        boxSizing: "border-box",
        alignItems: "center",
        flexWrap: {
          xs: "wrap",
          md: "wrap",
          lg: "nowrap"
        }
      }}
    >
      <Tooltip
        placement="top"
        title={"View pairwise text reuse data and statistics"}
      >
        <Typography
          onClick={() => {
            toggleSidePanel(
              {
                version_id: row?.version_code,
                release_code: row?.release_version?.release_code,
              },
              3
            );
          }}
          size={"small"}
          color={"neutral"}
          sx={{
            ml: "0px",
            fontSize: "16px",
            fontFamily: `Amiri,Roboto,"Helvetica Neue",Arial,sans-serif`,
            color: "rgba(0, 0, 0, 0.87)",
            cursor: "pointer",
            textAlign: "center"
          }}
        >
          {row?.release_version?.n_reuse_instances}
        </Typography>
      </Tooltip>
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center",
          flexWrap: "nowrap", 
          gap: 1 
        }}
      >
        <Tooltip
          placement="top"
          title={"View pairwise text reuse data and statistics"}
        >
          <Typography
            onClick={() => {
              toggleSidePanel(
                {
                  version_id: row?.version_code,
                  release_code: row?.release_version?.release_code,
                },
                3
              );
            }}
            size={"small"}
            color={"neutral"}
          >
            <i
              className="fa-solid fa-up-right-from-square"
              style={{
                fontSize: "14px",
                width: "25px",
                textAlign: "left",
                color: "#2863A5",
              }}
            ></i>
          </Typography>
        </Tooltip>
        {oneToAllFolders[releaseCode] ? (
          <Tooltip placement="top" title={"Visualise corpus-wide text reuse"}>
            <Typography
              sx={{
                cursor: "pointer",
              }}
            >
              <Link
                href={`${!REPO_NAME ? "" : `/${REPO_NAME}`}/#/visualise/${
                  row?.release_version?.release_code
                }/?books=${row?.release_version?.url
                  .split("/")
                  .slice(-1)[0]
                  .split(".")
                  .slice(2)
                  .join(".")}`}
                style={{ textDecoration: "none" }}
                target={"_blank"}
                rel="noreferrer"
              >
                <i
                  className="fa-solid fa-magnifying-glass-chart"
                  style={{
                    fontSize: "14px",
                    width: "25px",
                    textAlign: "left",
                    color: "#2863A5",
                  }}
                ></i>
              </Link>
            </Typography>
          </Tooltip>
        ) : (
          ""
        )}
      </Box>
      <Typography
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        Text Reuse
      </Typography>
    </TableCell>
  );
};

export default ReuseCell;
