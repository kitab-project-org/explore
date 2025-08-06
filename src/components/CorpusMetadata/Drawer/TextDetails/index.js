import { getGHRepo } from "../../../../utility/Helper";
import { displayNamesText } from "../ColumnDisplayName";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import CopyToClipboard from "../../../Common/CopyToClipboard";
import { Typography } from "@mui/material";
import GetFormattedFields from "../../../Common/GetFormattedFields";

const TextDetails = ({ fullData }) => {
  const text = fullData?.text;
  const date = text?.text_uri.substring(0, 4);
  const authorUri = text?.text_uri.split(".")[0];

  const data = [
    {
      header: displayNamesText.text_uri,
      body: text?.text_uri,
      link: getGHRepo(date) + authorUri + "/" + text?.text_uri,
      copy: true,
    },
    {
      header: displayNamesText.title_ar,
      body: text?.title_ar_prefered,
    },
    {
      header: displayNamesText.title_lat,
      body: text?.title_lat_prefered,
    },
    {
      header: displayNamesText.tags,
      body: text?.tags.split("::").join(";"),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              display: "flex",
              margin: "5px 0px",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Box sx={{ margin: "5px 0px" }} width={"20%"}>
              {item.header}
            </Box>
            <Box
              sx={{
                width: "75%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {item.link ? (
                <Link
                  to={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  {item.body}
                </Link>
              ) : (
                item.body
              )}
              {item.copy && <CopyToClipboard data={item.body} />}
            </Box>
          </Box>
        ))}
        <Box mt="30px">
          {fullData?.text?.related_places.length !== 0 && (
            <Typography variant="h5">Related Places</Typography>
          )}
          {fullData?.text &&
            fullData?.text?.related_places.map((rpObject, rpIndex) => (
              <Box key={rpIndex} py="10px">
                {Object.keys(rpObject).map((rpObjectItem, rpObjectIndex) => (
                  <Box
                    key={rpObjectIndex}
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "0px",
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <Box margin={"0px"} width={"20%"}>
                      {Object.keys(rpObject)[rpObjectIndex]}
                    </Box>
                    <Box
                      margin={"0px"}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        width: "75%",
                      }}
                    >
                      {Object.values(rpObject)[rpObjectIndex]}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
        </Box>
        {fullData?.text?.related_texts &&
          fullData?.text?.related_texts.length !== 0 && (
            <Box mt="30px">
              <Typography variant="h5">Related Texts</Typography>
              <Box
                margin={"0px"}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  width: "75%",
                }}
              >
                <Box>
                  <GetFormattedFields
                    data={fullData?.text?.related_texts}
                    type={"COMM"}
                  />
                </Box>
              </Box>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default TextDetails;
