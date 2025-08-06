import { useContext, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Context } from "../../../../App";

const MileStone = ({
  fullWidth,
  fontSize,
  item,          // milestone number
  data,          // Object: {content: <300 milestones>, ms: <ms_no(str)>, title: <book_title(str)>}
  content,       // Object: {ms_no: ms_str}  (one milestone, or more if user clicked load button)
  bookNumber
}) => {
  const { 
    focusMilestone1, 
    focusMilestone2, 
  } = useContext(Context);
  const typographyRef = useRef(null);
  const [notification, setNotification] = useState(false);
  const msText = fullWidth ? data?.content[item] : content[item];

  // enable scroll to -> TO DO: this should be moved to the alignment!
  const getRef = () => {
    if (bookNumber === 1) {
      return Number(data?.ms) === Number(item) ? focusMilestone1 : null;
    } else {
      return Number(data?.ms) === Number(item) ? focusMilestone2 : null;
    }
  };

  // doubleclicking the milestone copies it to clipboard:
  const handleDoubleClick = () => {
    if (typographyRef.current) {
      const plainText = typographyRef.current.textContent;
      navigator.clipboard
        .writeText(plainText)
        .then(() => {
          console.log("Copied to clipboard");
          setNotification(true);
          setTimeout(() => {
            setNotification(false);
          }, 1500);
        })
        .catch((err) => {
          console.error("Error copying text: ", err);
        });
    }
  };


  return (
    <Box
      display="flex"
      position="relative"
      width="100%"
      sx={{
        mb: "30px",
        "&:hover": {
          "& .msClass": {
            visibility: "visible",
          },
        },
      }}
    >
      <Box
        fontSize={fullWidth ? `${fontSize - 4}px` : "16px"}
        ref={getRef()}
        onDoubleClick={handleDoubleClick}
        className="msClass"
        sx={{
          width: "20px",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexWrap: "wrap",
          alignItems: "center",
          textAlign: "center",
          top: 0,
          left: "100%",
          ml: "0px",
          bottom: 0,
          visibility: "hidden",
          cursor: "pointer",
          userSelect: "none",
          bgcolor: "#f3f4f6",
          color: "black",
        }}
      >
        <Typography sx={{ fontSize: "11px" }}>MS</Typography>
        <Typography sx={{ fontSize: "11px" }}>{item}</Typography>
      </Box>
      {notification && (
        <Typography
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#bbf7d0",
            boxShadow: "0px 0px 5px 0px grey",
            p: "5px",
          }}
        >
          Text Copied
        </Typography>
      )}
      <Typography
        ref={typographyRef}
        sx={{
          pr: "10px",
          //bgcolor: Number(data?.ms) === Number(item) ? "lightgreen" : "",
        }}
        fontSize={fullWidth ? `${fontSize}px` : "20px"}
        dangerouslySetInnerHTML={{
          //__html: (Number(data?.ms) === Number(item)) ? splitMilestone(msText) : msText,
          __html: msText,
        }}
      />
    </Box>
  );
};

export default MileStone;
