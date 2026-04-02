import { useContext } from "react";
import { CSVLink } from "react-csv";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Context } from "../../../App";
import { getCorpusMetaDataTsvUrl } from "../../../services/CorpusMetaData";

// Function to flatten data for export (ChatGPT suggestion)
const flattenItem = (item) => ({
  id: item?.id,
  release_code: item?.release_version?.release_code,
  release_date: item?.release_version?.release_date,
  version_code: item?.version_code,
  version_uri: item?.version_uri,
  pdf_url: item?.edition?.pdf_url,
  language: item?.language,
  analysis_priority: item?.release_version?.analysis_priority,
  annotation_status: item?.release_version?.annotation_status,
  token_length: item?.release_version?.tok_length,
  char_length: item?.release_version?.char_length,
  url: item?.release_version?.url,
  text_tags: item?.text?.tags,
  text_uri: item?.text?.text_uri,
  title_ar_prefered: item?.text?.title_ar_prefered,
  title_lat_prefered: item?.text?.title_lat_prefered,
  author_uri: item?.text?.author?.[0]?.author_uri,
  author_ar_prefered: item?.text?.author?.[0]?.author_ar_prefered,
  author_lat_prefered: item?.text?.author?.[0]?.author_lat_prefered,
  author_date_AH: item?.text?.author?.[0]?.date_AH,
  author_date_CE: item?.text?.author?.[0]?.date_CE,
});


const DownloadData = ({ status }) => {
  const {
    checkedBooks,
    query,
    searchField,
    normalizedSearch,
    annotationFilter,
    sortingOrder,
    analysisPriority,
    releaseCode,
    advanceSearch,
    includeManuscripts,
    activeLanguages,
  } = useContext(Context);

  const hasSelection = checkedBooks.length > 0;
  const selectedData = hasSelection ? checkedBooks.map(flattenItem) : [];

  const handleApiDownload = () => {
    const languageQuery = activeLanguages.length > 0 ? activeLanguages.join(",") : "";
    const url = getCorpusMetaDataTsvUrl(
      query,
      searchField,
      normalizedSearch,
      annotationFilter,
      sortingOrder,
      analysisPriority,
      releaseCode,
      advanceSearch,
      includeManuscripts,
      languageQuery
    );
    console.log("TSV download URL:", url);
    // Navigate directly to the URL; the server sets Content-Disposition: attachment
    // so the browser downloads the file rather than displaying it.
    const link = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = status === "loading";

  const tooltipTitle = hasSelection
    ? "Download selected metadata in tsv format"
    : "Download all matching metadata in tsv format";

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <span>
        {isLoading ? (
          <IconButton size="large" variant="text" sx={{ fontSize: "15px" }}>
            <CircularProgress size={"15px"} sx={{ color: "green" }} />
          </IconButton>
        ) : hasSelection ? (
          <CSVLink
            data={selectedData}
            enclosingCharacter={""}
            separator={"\t"}
            filename="kitabapps_data.tsv"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              color: "#6b7280",
            }}
          >
            <IconButton size="large" variant="text" sx={{ fontSize: "15px", padding: "5px" }}>
              <i className="fa-solid fa-table-list" style={{ color: "#2863A5" }}></i>
            </IconButton>
          </CSVLink>
        ) : (
          <IconButton
            size="large"
            variant="text"
            sx={{ fontSize: "15px", padding: "5px" }}
            onClick={handleApiDownload}
          >
            <i className="fa-solid fa-table-list" style={{ color: "#2863A5" }}></i>
          </IconButton>
        )}
      </span>
    </Tooltip>
  );
};

export default DownloadData;
