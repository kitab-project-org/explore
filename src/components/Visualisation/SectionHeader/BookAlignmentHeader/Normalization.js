import { useContext } from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { Context } from "../../../../App";

const Normalization = () => {
  const { 
    normalizeAlif, 
    setNormalizeAlif,
    normalizeYa, 
    setNormalizeYa,
    normalizeHa, 
    setNormalizeHa,
    removePunct, 
    setRemovePunct,
    removeTags, 
    setRemoveTags,
  } = useContext(Context);

  const handleNormalizeAlif = () => {
    setNormalizeAlif((prev) => !prev);
  }
  const handleNormalizeYa = () => {
    setNormalizeYa((prev) => !prev);
  }
  const handleNormalizeHa = () => {
    setNormalizeHa((prev) => !prev);
  }
  const handleRemovePunct = () => {
    setRemovePunct((prev) => !prev);
  }
  const handleRemoveTags = () => {
    setRemoveTags((prev) => !prev);
  }
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "14px",
          textAlign: "left",
          mb: "-5px",
          mt: "7px",
        }}
      >
        Normalize:
      </Typography>
      <Tooltip placement="top" title={"Normalize all combinations of alif with madda or hamza (أ = ا = إ = آ)"}>
        <Button onClick={handleNormalizeAlif}>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: "8px", mt: "2px" }}>
              {normalizeAlif ? (
                  <i className="fa-solid fa-square-check"></i>
              ) : (
                  <i className="fa-regular fa-square"></i>
              )}
            </Typography>
            <Typography
              ariant="body2"
              sx={{ textTransform: "none", color: "#333" }}
            >
              Alifs
            </Typography>
          </Box>
        </Button>
      </Tooltip>
      <Tooltip placement="top" title={"Normalize alif maqsūra and Persian yāʾ to Arabic yāʾ"}>
        <Button onClick={handleNormalizeYa}>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: "8px", mt: "2px" }}>
              {normalizeYa ? (
                <i className="fa-solid fa-square-check"></i>
              ) : (
                <i className="fa-regular fa-square"></i>
              )}
            </Typography>
            <Typography
              ariant="body2"
              sx={{ textTransform: "none", color: "#333" }}
            >
              Yāʾ / Alif maqsūra
            </Typography>
          </Box>
        </Button>
      </Tooltip>
      <Tooltip placement="top" title={"Normalize tāʾ marbūṭa to hāʾ "}>
        <Button onClick={handleNormalizeHa}>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: "8px", mt: "2px" }}>
              {normalizeHa ? (
                <i className="fa-solid fa-square-check"></i>
              ) : (
                <i className="fa-regular fa-square"></i>
              )}
            </Typography>
            <Typography
              ariant="body2"
              sx={{ textTransform: "none", color: "#333" }}
            >
              Hāʾ / tāʾ marbūṭa
            </Typography>
          </Box>
        </Button>
      </Tooltip>
      <Tooltip placement="top" title={"Remove all punctuation"}>
        <Button onClick={handleRemovePunct}>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: "8px", mt: "2px" }}>
              {removePunct ? (
                  <i className="fa-solid fa-square-check"></i>
              ) : (
                  <i className="fa-regular fa-square"></i>
              )}
            </Typography>
            <Typography
              ariant="body2"
              sx={{ textTransform: "none", color: "#333" }}
            >
              Remove punctuation
            </Typography>
          </Box>
        </Button>
      </Tooltip>
      <Tooltip placement="top" title={"Remove all OpenITI tags"}>
        <Button onClick={handleRemoveTags}>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: "8px", mt: "2px" }}>
              {removeTags ? (
                  <i className="fa-solid fa-square-check"></i>
              ) : (
                  <i className="fa-regular fa-square"></i>
              )}
            </Typography>
            <Typography
              ariant="body2"
              sx={{ textTransform: "none", color: "#333" }}
            >
              Remove OpenITI tags
            </Typography>
          </Box>
        </Button>
      </Tooltip>
    </Box>
  );
};

export default Normalization;