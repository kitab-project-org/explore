import { Button } from "@mui/material";
import { Tooltip } from "@mui/material";
import { Context } from "../../../../App";
import React, { useContext } from "react";

const FlipButton = () => {
  const { isFlipped, setIsFlipped, setFlipTimeLoading } = useContext(Context);

  const handleFlipBooks = () => {
    setFlipTimeLoading(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
    }, 300);
    setTimeout(() => {
      setFlipTimeLoading(false);
    }, 1000);
  };

  return (
    <Tooltip title="Flip books" placement="top">
      <Button
        onClick={handleFlipBooks}
        color="primary"
        variant="outlined"
        rel="noreferrer"
        target="_blank"
        sx={{
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          minWidth: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "14px",
          color: "#2862a5",
          border: "1px solid #2862a5",
          mr: "10px",
          transition: ".5s",
          transform: isFlipped ? "rotate(90deg)" : "rotate(270deg)",
        }}
      >
        <i className="fa-solid fa-right-left"></i>
      </Button>
    </Tooltip>
  );
};

export default FlipButton;
