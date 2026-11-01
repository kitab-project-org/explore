import { useContext, useState } from "react";
import { 
  Avatar,
  AppBar,
  Box,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography
 } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { makeStyles } from "@mui/styles";
import { Context } from "../../../App";

export const REPO_NAME = "explore";

const useStyles = makeStyles((theme) => ({
  responsiveBrand: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
    [theme.breakpoints.up("sm")]: {
      padding: "block",
    },
  },
}));

const Navigationbar = () => {
  const { releaseCode } = useContext(Context);
  const classes = useStyles();
  const [anchorElNav, setAnchorElNav] = useState(null);

  // nav menu toggler open
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  // nav menu toggler close
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const pages = [
    {
      label: "About",
      link: "http://kitab-project.org/about/",
    },
    {
      label: "Corpus and Data",
      link: `${!REPO_NAME ? "" : `/${REPO_NAME}`}/#/insight`,
    },
    {
      label: "Methods",
      link: "http://kitab-project.org/methods",
    },
    {
      label: "Research",
      link: "http://kitab-project.org/blogs",
    },
    {
      label: "Arabic Pasts",
      link: "http://kitab-project.org/research/events/arabic-pasts",
    },
    {
      label: "OpenITI Corpus Metadata",
      link: `${!REPO_NAME ? "" : `/${REPO_NAME}`}/#/metadata/${releaseCode}/`,
    },
    {
      label: "Visualisation",
      link: `${!REPO_NAME ? "" : `/${REPO_NAME}`}/#/visualise/${releaseCode}/`,
    },
  ];

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#eee",
          borderBottom: "1px solid #cecfd1",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "1350px",
            },
            m: "auto",
            py: {
              xs: ".1rem",
              sm: "1rem",
            },
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link
              href={`${!REPO_NAME ? "" : `/${REPO_NAME}/`}`}
              sx={{
                width: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className={classes.responsiveBrand}
            >
              <Avatar
                alt="KITAB Logo"
                src="https://kitab-project.org/assets/images/logo-small-2.png"
                sx={{
                  height: "44px",
                  width: "44px",
                  borderRadius: "0px",
                }}
              />
            </Link>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="primary"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <Link
                    href={page.link}
                    key={page.label}
                    sx={{
                      fontFamily: `-apple-system,BlinkMacSystemFont,"Roboto","Segoe UI","Helvetica Neue","Lucida Grande",Arial,sans-serif`,
                      fontSize: "22px",
                      color: "#222831",
                      position: "relative",
                      textDecoration: "none",
                    }}
                  >
                    <MenuItem onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
            >
              <Avatar
                alt="KITAB Logo"
                src="https://kitab-project.org/assets/images/logo-small-2.png"
              />
            </Typography>
            <Box sx={{ display: { xs: "none", md: "flex" }, flexWrap: "wrap" }}>
              {pages.map((page) => (
                <Link
                  key={page.label}
                  href={page.link}
                  sx={{
                    display: "block",
                    mx: "1.5rem",
                    pointer: page.dropdown ? "" : "none",
                    textDecoration: "none",
                    fontFamily: `-apple-system,BlinkMacSystemFont,"Roboto","Segoe UI","Helvetica Neue","Lucida Grande",Arial,sans-serif`,
                    fontSize: "22px",
                    color: "#222831",
                    position: "relative",
                  }}
                >
                  {page.label}
                </Link>
              ))}
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
    </>
  );
};
export default Navigationbar;
