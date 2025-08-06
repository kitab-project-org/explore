import { Box } from "@mui/material";
import { getGHRepo } from "../../../../utility/Helper";
import {
  // displayAuthorDetailsRelatedPlaces,
  displayNamesAuthor,
} from "../ColumnDisplayName";
import NameElementsTable from "./NameElementsTable";
import { Link } from "react-router-dom";
import CopyToClipboard from "../../../Common/CopyToClipboard";
import { Typography } from "@mui/material";
import GetFormattedFields from "../../../Common/GetFormattedFields";

const AuthorDetails = ({ fullData }) => {
  const author = fullData?.text?.author[0];

  // organize author data
  const data = [
    {
      header: displayNamesAuthor.author_uri,
      body: author?.author_uri,
      link: getGHRepo(author?.date) + author?.author_uri,
      copy: true,
    },
    {
      header: displayNamesAuthor.author_ar,
      body: author?.author_ar_prefered,
    },
    {
      header: displayNamesAuthor.author_lat,
      body: author?.author_lat_prefered,
    },
    {
      header: displayNamesAuthor.authorDateAH,
      body: author?.date_AH,
    },
    {
      header: displayNamesAuthor.authorDateCE,
      body: author?.date_CE,
    },
    {
      header: displayNamesAuthor.notes,
      body: author?.notes.replace(/¶ */g, " "),
    },
    {
      header: displayNamesAuthor.name_elements,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {data.map((item, index) => (
        <Box
          key={index}
          sx={{
            width: "100%",
            display: "flex",
            margin: "5px 0px",
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
            "&:last-child": {
              borderBottom: "0px",
            },
          }}
        >
          {item.header === "Name Elements" ? (
            author && (
              <Box width={"100%"} margin={"5px 0px"}>
                {item.header}
                <NameElementsTable data={author?.name_elements} />
              </Box>
            )
          ) : (
            <Box sx={{ width: "25%", margin: "5px 0px" }}>{item.header}</Box>
          )}

          {item.header === "Name Elements" ? (
            ""
          ) : (
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
          )}
        </Box>
      ))}

      {author?.related_places && author?.related_places.length !== 0 && (
        <Box mt="30px">
          <Typography variant="h5">Related Places</Typography>
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
              <Typography mt={1}>{author?.author_lat_prefered}</Typography>

              <GetFormattedFields data={author?.related_places} type={"BORN"} />
              <GetFormattedFields data={author?.related_places} type={"DIED"} />
              <GetFormattedFields
                data={author?.related_places}
                type={"RESID"}
              />
              <GetFormattedFields
                data={author?.related_places}
                type={"VISIT"}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AuthorDetails;
