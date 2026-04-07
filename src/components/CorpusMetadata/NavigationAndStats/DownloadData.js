import { useContext } from "react";
import { CSVLink } from "react-csv";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Context } from "../../../App";
import { getCorpusMetaDataTsvUrl } from "../../../services/CorpusMetaData";

// Flatten a row for client-side TSV export, matching the API's version-tsv columns.
const flattenItem = (item) => ({
  release_code:     item?.release_version?.release_code,
  version_code:     item?.version_code,
  version_uri:      item?.version_uri,
  pdf_url:          item?.edition?.pdf_url,
  language:         item?.language,
  analysis_priority: item?.release_version?.analysis_priority,
  annotation_status: item?.release_version?.annotation_status,
  token_length:     item?.release_version?.tok_length,
  char_length:      item?.release_version?.char_length,
  url:              item?.release_version?.url,
  text_uri:         item?.text?.text_uri,
  text_tags:        item?.text?.tags,
  title_ar:         item?.text?.title_ar_prefered,
  title_lat:        item?.text?.title_lat_prefered,
  author_uri:       item?.text?.author?.[0]?.author_uri,
  author_date_AH:   item?.text?.author?.[0]?.date_AH,
  author_date_CE:   (() => {
    const start = item?.text?.author?.[0]?.date_CE;
    const end = item?.text?.author?.[0]?.date_CE_end;
    if (!start) return undefined;
    return (!end || end === start) ? start : `${start}-${end}`;
  })(),
  location_uri:     item?.manuscript?.manuscript_holding?.loc_uri,
  location_ar:      item?.manuscript?.manuscript_holding?.names?.ar,
  location_lat:     item?.manuscript?.manuscript_holding?.names?.lat,
  shelfmark:        item?.manuscript?.shelfmark,
});


const DownloadData = ({ status }) => {
  const {
    checkedBooks,
    query,
    searchField,
    normalizedSearch,
    annotationFilter,
    sortingOrder,
    showPrimary,
    showSecondary,
    releaseCode,
    advanceSearch,
    activeTextTypes,
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
      showPrimary,
      showSecondary,
      releaseCode,
      advanceSearch,
      activeTextTypes,
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
