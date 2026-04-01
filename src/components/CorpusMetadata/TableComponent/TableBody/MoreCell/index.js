import { useContext } from "react";
import { Checkbox, TableCell, Tooltip } from "@mui/material";
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
          md: "4%",
        },
        border: "none",
        display: "flex",
        justifyContent: {
          xs: "space-between !important",
          md: "center !important",
        },
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <Tooltip title="Select rows to view text reuse data / download metadata">
        <Checkbox
          size="small"
          checked={isChecked(row)}
          onChange={() => handleChecked(row)}
          sx={{ p: 0 }}
        />
      </Tooltip>
    </TableCell>
  );
};

export default MoreCell;
