import { useContext, useEffect, useRef, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { experimentalStyled as styled } from "@mui/material/styles";
import TopTenBooks from "./BarChart";
import VersionDropdown from "../Common/VersionDropdown";
import { Context } from "../../App";
import { convertNumberToMillions } from "../../utility/Helper";
import { getCorpusInsightData } from "../../services/CorpusMetaData";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function InsightComponent() {
  const { releaseCode } = useContext(Context);
  const chartBox = useRef();
  const [insightData, setInsightData] = useState({});
  const [leargestTenBooks, setLeargestTenBooks] = useState([]);

  const data = [
    {
      title: "Total Authors",
      data: insightData?.number_of_authors
        ? insightData?.number_of_authors
        : "",
      color1: "rgb(255, 0, 230)",
      color2: "rgb(255, 0, 230, .3)",
      icon: "fa-solid fa-users",
    },
    {
      title: "Total Versions",
      data: insightData?.number_of_versions
        ? insightData?.number_of_versions
        : "",
      color1: "rgb(26, 0, 255)",
      color2: "rgb(26, 0, 255, .3)",
      icon: "fa-solid fa-code-branch",
    },
    {
      title: "Primary Versions",
      data: insightData?.number_of_pri_versions
        ? insightData?.number_of_pri_versions
        : "",
      color1: "rgb(137, 0, 255)",
      color2: "rgb(137, 0, 255, .3)",
      icon: "fa-solid fa-code-pull-request",
    },
    {
      title: "Secondary Versions",
      data: insightData?.number_of_sec_versions
        ? insightData?.number_of_sec_versions
        : "",
      color1: "rgb(0, 255, 9)",
      color2: "rgb(0, 255, 9, .3)",
      icon: "fa-solid fa-code-merge",
    },
    {
      title: "Total Word Count",
      data: insightData?.total_word_count ? insightData?.total_word_count : "",
      color1: "rgb(255, 0, 0)",
      color2: "rgb(255, 0, 0, .3)",
      icon: "fa-solid fa-arrow-up-z-a",
    },
    {
      title: "Largest Book",
      data: insightData?.largest_book ? insightData?.largest_book : "",
      color1: "rgb(105, 124, 149)",
      color2: "rgb(105, 124, 149, .3)",
      icon: "fa-regular fa-bookmark",
    },
    {
      title: "Total Books",
      data: insightData?.number_of_books ? insightData?.number_of_books : "",
      color1: "rgb(234, 179, 8)",
      color2: "rgb(234, 179, 8, .3)",
      icon: "fa-solid fa-book",
    },
    {
      title: "Completed Versions",
      data: insightData?.number_of_completed_versions
        ? insightData?.number_of_completed_versions
        : "",
      color1: "rgb(234, 88, 12)",
      color2: "rgb(234, 88, 12, .3)",
      icon: "fa-regular fa-circle-check",
    },
    {
      title: "Markdown Versions",
      data: insightData?.number_of_markdown_versions
        ? insightData?.number_of_markdown_versions
        : "",
      color1: "rgb(0, 128, 0)",
      color2: "rgb(0, 128, 0, .3)",
      icon: "fa-solid fa-signal",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCorpusInsightData(releaseCode);
      setInsightData(response);
      if (response?.largest_10_books) {
        // Convert the parsed object to an array of objects
        const booksArray = Object.entries(
          JSON.parse(response?.largest_10_books)
        ).map(([key, value]) => ({
          title: key,
          value: value,
        }));
        setLeargestTenBooks(booksArray);
      } else {
        setLeargestTenBooks([]);
      }
    };
    fetchData();
  }, [releaseCode]);

  return (
    <Box
      mx={"auto"}
      display={"flex"}
      flexDirection={"column"}
      sx={{
        width: {
          xs: "100%",
          xl: "1280px",
        },
        pt: "50px",
        float: {
          xs: "left",
          sm: "inherit",
        },
        px: {
          xs: "15px",
          sm: "30px",
          xl: "0px",
        },
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mb={"50px"}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "24px",
              xl: "34px",
            },
          }}
        >
          Corpus Insights
        </Typography>
        <VersionDropdown />
      </Box>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {data.map((item, index) => (
          <Grid item xs={2} sm={4} md={4} key={index}>
            <Item
              sx={{
                color: "white",
                position: "relative",
                height: {
                  xs: "100px",
                  sm: "120px",
                },
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
              }}
              style={{
                background: `linear-gradient(45deg, ${item.color1}, ${item.color2})`,
              }}
            >
              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  position: "absolute",
                  left: 30,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "40px",
                  opacity: ".4",
                }}
              >
                <i className={item.icon}></i>
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {item.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: {
                    xs: "28px",
                    sm: "42px",
                  },
                }}
                fontWeight={600}
              >
                {convertNumberToMillions(item.data)}
              </Typography>
            </Item>
          </Grid>
        ))}
        <Box
          width={"100%"}
          sx={{
            padding: {
              xs: "20px",
              md: "30px",
            },
          }}
        >
          <Box width={"100%"} ref={chartBox}>
            <TopTenBooks
              data={leargestTenBooks}
              width={chartBox?.current?.clientWidth}
            />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
