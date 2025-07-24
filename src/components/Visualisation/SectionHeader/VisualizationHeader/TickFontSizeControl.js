import { Button } from "@mui/material";
import { TextField, Tooltip, ClickAwayListener } from "@mui/material";
import * as d3 from "d3";
import { Context } from "../../../../App";
import React, { useContext, useEffect, useRef } from "react";


const TickFontSizeControl = ({ svgSelector = '#svgChart' }) => {
  const {showTickSizeInput, setShowTickSizeInput, tickFontSize, setTickFontSize} = useContext(Context);
  const tickInputRef = useRef(null);

  // Apply font size when it changes
  useEffect(() => {
    d3.selectAll(`${svgSelector} .tick text`).style("font-size", `${tickFontSize}px`);
  }, [tickFontSize, svgSelector]);
  
  const handleIconClick = () => {
    setShowTickSizeInput(true);
  };

  const handleInputChange = (e) => {
    setTickFontSize(parseInt(e.target.value) || 12);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowTickSizeInput(false);
    }
  };

  // Handle click outside to hide input
  const handleClickAway = () => {
    setShowTickSizeInput(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
        <Tooltip title="Change Tick Font Size" placement="top">
          <Button
            onClick={handleIconClick}
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
              transition: ".5s"
            }}
          >
            <i className="fa-solid fa-text-height"></i>
          </Button>
        </Tooltip>

        {showTickSizeInput && (
          <TextField
            inputRef={tickInputRef}
            type="number"
            value={tickFontSize}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            size="small"
            variant="outlined"
            sx={{
              width: 60,
              ml: 1,
              "& .MuiInputBase-input": {
                padding: "6px 8px",
                fontSize: "0.85rem",
              },
            }}
          />
        )}
      </div>
    </ClickAwayListener>
  );
};

export default TickFontSizeControl;
