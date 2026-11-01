import { Box, Link, Typography } from "@mui/material";

const data = [
  {
    label: "GitHub",
    path: "https://github.com/OPENITI",
    icon: "fab fa-fw fa-github",
  },
  {
    label: "KITAB Github",
    path: "https://github.com/kitab-project-org",
    icon: "fab fa-fw fa-github-square",
  },
  {
    label: "ISMC Facebook",
    path: "https://www.facebook.com/akuismclondon/",
    icon: "fab fa-fw fa-facebook",
  },
  {
    label: "ISMC Twitter",
    path: "https://twitter.com/AKU_ISMC",
    icon: "fab fa-fw fa-twitter",
  },
  {
    label: "ISMC LinkedIn",
    path: "https://www.linkedin.com/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fschool%2F78109905%2Fadmin%2F",
    icon: "fab fa-fw fa-linkedin",
  },
  {
    label: "ISMC YouTube",
    path: "https://www.youtube.com/channel/UC02QlE0dFyWIpgeAQtIyNjQ?view_as=subscriber",
    icon: "fab fa-fw fa-youtube",
  },
];

const LeftSide = () => {
  return (
    <Box display={"flex"} flexWrap={"wrap"} width={"50%"}>
      <Typography
        sx={{ color: "white", mr: "10px", mb: "10px" }}
        fontSize={"20px"}
        fontWeight={"600"}
      >
        <strong>Follow:</strong>
      </Typography>

      {data.map((item, i) => (
        <Typography
          key={i}
          sx={{
            color: "white",
            mr: "20px",
            mb: "10px",
            fontSize: {
              xs: "16px",
              sm: "20px",
            },
          }}
          fontWeight={"600"}
        >
          <Link
            sx={{ color: "white" }}
            href={item.path}
            rel="nofollow noopener noreferrer"
          >
            <i className={item.icon} aria-hidden="true"></i> {item.label}
          </Link>
        </Typography>
      ))}

      <Box sx={{ color: "white", mr: "5px", width: "100%" }} fontSize={"15px"}>
        © 2023 KITAB. Powered by{" "}
        <Link
          sx={{ color: "white" }}
          href="https://jekyllrb.com"
          rel="nofollow"
        >
          Jekyll
        </Link>{" "}
        &amp;{" "}
        <Link
          sx={{ color: "white" }}
          href="https://mademistakes.com/work/minimal-mistakes-jekyll-theme/"
          rel="nofollow"
        >
          Minimal Mistakes
        </Link>
        .
      </Box>
    </Box>
  );
};

export default LeftSide;
