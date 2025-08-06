import { Box, Tooltip } from "@mui/material";
import { useState } from "react";

const CopyToClipboard = ({ data }) => {
  const [isCopied, setIsCopied] = useState(false);

  // function for copy a id
  const handleCopy = (e) => {
    e.preventDefault();
    if (!isCopied) {
      navigator.clipboard.writeText(data);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  };
  return (
    <Tooltip title="Copy to Clipboard">
      <Box
        sx={{
          bgcolor: "none",
          p: "0px",
          ml: "15px",
          width: "22px",
          height: "22px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: isCopied ? "#3b82f6" : "#6b7280",
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "16px",
        }}
        onClick={(e) => handleCopy(e)}
      >
        {isCopied ? (
          <i className="fa-solid fa-clipboard-check"></i>
        ) : (
          <i className="fa-regular fa-clipboard"></i>
        )}
      </Box>
    </Tooltip>
  );
};

export default CopyToClipboard;
