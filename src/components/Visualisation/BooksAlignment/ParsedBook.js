import { useContext } from "react";
import { Box } from "@mui/material";
import { Context } from "../../../App";

const ParsedBook = ({ parsedBookAlignment, isLeft }) => {
  console.log("Entering ParsedBook function");
  const { isFlipped, bookIntoRows } = useContext(Context);

  if (isLeft) {
    return (
      <Box
        fontSize="20px"
        sx={{ wordWrap: "break-word" }}
        px="20px"
        className="difftext"
      >
        {bookIntoRows ? (
          isFlipped ? (
            parsedBookAlignment?.s2
              .split("###NEW_ROW###")
              .map((item, key) => (
                <div key={key} dangerouslySetInnerHTML={{ __html: item }}></div>
              ))
          ) : (
            parsedBookAlignment?.s1
              .split("###NEW_ROW###")
              .map((item, key) => (
                <div key={key} dangerouslySetInnerHTML={{ __html: item }}></div>
              ))
          )
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: isFlipped
                ? parsedBookAlignment?.s2
                : parsedBookAlignment?.s1,
            }}
          />
        )}
      </Box>
    );
  } else {
    return (
      <Box
        fontSize="20px"
        sx={{ wordWrap: "break-word" }}
        px="20px"
        className="difftext"
      >
        {bookIntoRows ? (
          isFlipped ? (
            parsedBookAlignment?.s1
              .split("###NEW_ROW###")
              .map((item, key) => (
                <div key={key} dangerouslySetInnerHTML={{ __html: item }}></div>
              ))
          ) : (
            parsedBookAlignment?.s2
              .split("###NEW_ROW###")
              .map((item, key) => (
                <div key={key} dangerouslySetInnerHTML={{ __html: item }}></div>
              ))
          )
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: isFlipped
                ? parsedBookAlignment?.s1
                : parsedBookAlignment?.s2,
            }}
          />
        )}
      </Box>
    );
  }
};

export default ParsedBook;
