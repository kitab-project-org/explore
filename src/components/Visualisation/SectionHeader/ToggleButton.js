import { Button, Tooltip } from "@mui/material";

const ToggleButton = ({ toggle, setToggle }) => {
  return (
    <Tooltip title="Toggle" placement="top">
      <Button
        onClick={() => setToggle(!toggle)}
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
        }}
      >
        {toggle ? (
          <i className="fa-solid fa-chevron-down"></i>
        ) : (
          <i className="fa-solid fa-chevron-up"></i>
        )}
      </Button>
    </Tooltip>
  );
};

export default ToggleButton;
