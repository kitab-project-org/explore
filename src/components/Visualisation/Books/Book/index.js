import { useContext } from "react";
import { Box } from "@mui/material";
import Contents from "../Contents";
import ContentHeader from "../ContentHeader";
import { Context } from "../../../../App";

const Book = ({ leftWidth, handler, chartSpecificBar, parsedBookAlignment, isLeft, alignmentOnly }) => {
  const { books, isFlipped, metaData } = useContext(Context);
  console.log("Entering Book function");
  console.log(parsedBookAlignment);
  if (isLeft) {
    return (
      <Box
        width={`${leftWidth}%`}
        display={books?.book1 ? "block" : "hidden"}
        pr={"20px"}
      >
        <ContentHeader
          handleOpen={handler}
          data={isFlipped ? books?.book2 : books?.book1}
          bookNumber={isFlipped ? 2 : 1}
          ms={
            isFlipped ? metaData?.book2?.wordCount : metaData?.book1?.wordCount
          }
          parsedBookAlignment={parsedBookAlignment}
          isLeft={isLeft}
        />
        <Contents
          data={isFlipped ? books?.book2 : books?.book1}
          handleOpen={handler}
          chartSpecificBar={chartSpecificBar}
          bookNumber={isFlipped ? 2 : 1}
          parsedBookAlignment={parsedBookAlignment}
          isLeft={isLeft}
          alignmentOnly={alignmentOnly}
        />
      </Box>
    );
  } else {
    return (
      <Box
        width={`${100 - leftWidth}%`}
        display={books?.book2 ? "block" : "hidden"}
        pl={"20px"}
      >
        <ContentHeader
          handleOpen={handler}
          data={isFlipped ? books?.book1 : books?.book2}
          bookNumber={isFlipped ? 1 : 2}
          ms={
            isFlipped ? metaData?.book1?.wordCount : metaData?.book2?.wordCount
          }
        />
        <Contents
          data={isFlipped ? books?.book1 : books?.book2}
          handleOpen={handler}
          chartSpecificBar={chartSpecificBar}
          bookNumber={isFlipped ? 1 : 2}
          parsedBookAlignment={parsedBookAlignment}
          isLeft={isLeft}
          alignmentOnly={alignmentOnly}
        />
      </Box>
    );
  }
};

export default Book;
