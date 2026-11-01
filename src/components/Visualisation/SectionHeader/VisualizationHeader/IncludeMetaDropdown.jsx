import { useContext, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Tooltip,
} from "@mui/material";
import { Context } from "../../../../App";


const IncludeMetaDropdown = () => {
  const {
    includeMetaInDownload,
    setIncludeMetaInDownload,
    metaPositionInDownload,
    setMetaPositionInDownload,
  } = useContext(Context); 

 
  const handleInclMetaChange = (e) => {
    setIncludeMetaInDownload(e.target.value);
  }

  const handlePosChange = (e) => {
    setMetaPositionInDownload(e.target.value);
  };

  const metadataOptions = [
    { value: "no", label: "No" },
    { value: "author", label: "Author" },
    { value: "title", label: "Title" },
    { value: "author+title", label: "Author + Title" },
    { value: "versionCode", label: "Version Code" },
  ];

  const positionOptions = [
    { value: "left", label: "Left side" },
    { value: "topbottom", label: "Top and bottom" },
  ];

  useEffect(() => {
    console.log("Initial metadataType:", includeMetaInDownload);
  }, [includeMetaInDownload]);

  return (
    <Box display="flex" gap={2} alignItems="center">
      <Tooltip placement="top" title="Include metadata in the downloaded image?">
        <FormControl size="small">
          <InputLabel id="metadata-type-label">Include metadata:</InputLabel>
          <Select
            labelId="metadata-type-label"
            value={includeMetaInDownload}
            label="Include metadata:"
            onChange={handleInclMetaChange}
            sx={{ 
                width: 160,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
          >
            {metadataOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {includeMetaInDownload !== "no" && (
        <Tooltip placement="top" title="Where should the metadata appear?">
          <FormControl size="small">
            <InputLabel id="metadata-position-label">Position</InputLabel>
            <Select
              labelId="metadata-position-label"
              value={metaPositionInDownload}
              label="Position"
              onChange={handlePosChange}
              sx={{ 
                width: 150,
                ml: 1,
                "& .MuiInputBase-input": {
                  padding: "6px 8px",
                  fontSize: "0.85rem",
                },
            }}
            >
              {positionOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      )}
    </Box>
  );
};

export default IncludeMetaDropdown;