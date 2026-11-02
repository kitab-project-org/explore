import { useState } from "react";
import { Button, Menu, MenuItem, Typography } from "@mui/material";

// Set `available` to true once a tour has been implemented
// (and handled by the page's onStartTour).
export const TOURS = [
  { key: "main", label: "Main Page Tour", available: true },
  { key: "pairwise", label: "Pairwise Visualization Tour", available: true },
  { key: "corpuswide", label: "Corpuswide Visualization Tour", available: true },
];

// sessionStorage flag: start the main page tour once the landing page has loaded
export const MAIN_TOUR_REQUEST = "kitab-start-main-tour";

/* The "Take a tour" button with a dropdown of all tours.
 *   current: key of the tour that belongs to the page the user is on
 *            (highlighted in the dropdown)
 *   onStartTour(key): called with the key of the chosen tour
 *   buttonId: id of the button (used as a target by the tours)
 */
const TourMenu = ({ current, onStartTour, buttonId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  return (
    <>
      <Button
        id={buttonId}
        size="small"
        variant="outlined"
        startIcon={<i className="fa-solid fa-signs-post"></i>}
        endIcon={<i className="fa-solid fa-caret-down"></i>}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
      >
        Take a tour
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {TOURS.map(({ key, label, available }) => {
          const isCurrent = key === current;
          return (
            <MenuItem
              key={key}
              disabled={!available}
              selected={isCurrent}
              onClick={() => {
                setAnchorEl(null);
                onStartTour?.(key);
              }}
              sx={isCurrent ? { fontWeight: 700, gap: 1 } : { gap: 1 }}
            >
              {label}
              {isCurrent && available && (
                <Typography component="span" variant="caption" color="primary">
                  (this page)
                </Typography>
              )}
              {!available && " (coming soon)"}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default TourMenu;
