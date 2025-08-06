import { useContext } from "react";
import { ButtonGroup, Checkbox, TableCell, Tooltip, Typography } from "@mui/material";
import GtihubActions from "./GithubActions";
import { Context } from "../../../../../App";

// download raw github file
export function downloadGitHubRawFile(row) {
  const outputFilename = `${row?.version_uri}.txt`;

  fetch(row?.release_version?.url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to download file.");
      }
      return response.blob();
    })
    .then((blob) => {
      // Create a temporary anchor element
      const anchor = document.createElement("a");
      anchor.style.display = "none";
      document.body.appendChild(anchor);

      // Create a URL object from the blob
      const url = window.URL.createObjectURL(blob);

      // Set the anchor's href to the URL
      anchor.href = url;

      // Set the anchor's download attribute and filename
      anchor.download = outputFilename;

      // Trigger a click event on the anchor element to start the download
      anchor.click();

      // Clean up by revoking the URL object
      window.URL.revokeObjectURL(url);

      // Remove the temporary anchor element from the document
      document.body.removeChild(anchor);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

const MoreCell = ({ classes, row }) => {
  const { checkedBooks, setCheckedBooks } = useContext(Context);

  // mark metadata row
  const handleChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return (
        item?.release_version?.release_code ===
          value?.release_version?.release_code && item?.id === value?.id
      );
    });
    if (filter.length === 1) {
      const filter = checkedBooks.filter((item) => {
        return item?.id !== value?.id;
      });
      setCheckedBooks(filter);
    } else {
      setCheckedBooks([...checkedBooks, row]);
    }
  };

  const isChecked = (value) => {
    const filter = checkedBooks.filter((item) => {
      return item?.id === value?.id;
    });
    if (filter.length === 1) {
      return true;
    } else {
      return false;
    }
  };

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
          xs: "space-between !important",
          md: "flex-end !important",
        },
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <ButtonGroup
        sx={{ display: "flex", alignItems: "center" }}
        variant="outlined"
        aria-label="outlined button group"
      >
        <GtihubActions versionURI={row?.version_uri} />
        <Tooltip title="Select rows to view text reuse data / download metadata">
          <Checkbox
            checked={isChecked(row)}
            onChange={() => handleChecked(row)}
          />
        </Tooltip>
      </ButtonGroup>
      <Typography
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        More
      </Typography>
    </TableCell>
  );
};

export default MoreCell;
