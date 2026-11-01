import { useContext, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import ParsedBook from "./ParsedBook";
import WikiEdDiffModal from "./WikiEdDiffModal";
import SectionHeader from "../SectionHeader";
import BookAlignmentHeader from "../SectionHeader/BookAlignmentHeader";
import { kitabDiff } from "../../../assets/js/kitabDiff";
import { cleanImech } from "../../../utility/Helper";
import { Context } from "../../../App";

const BooksAlignment = () => {
  // ??
  const bookAlignmentRef = useRef();
  // get variables from the context:
  const { books, isFlipped, booksAlignment, setBooksAlignment, bookIntoRows } =
    useContext(Context);
  // set new variables to default values:
  const [parsedBookAlignment, setParsedBookAlignment] = useState({
    s1: "",
    s2: "",
  });
  const [wikiDiffBook, setWikiDiffBook] = useState("");
  const [leftWidth, setLeftWidth] = useState(50);
  const [barPositon, setBarPostion] = useState(50);

  const handleResizer = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (bookAlignmentRef.current) {
      const containerWidth = bookAlignmentRef.current.offsetWidth;
      const layerX =
        e.clientX - bookAlignmentRef.current.getBoundingClientRect().left;
      const newLeftWidth = parseFloat((layerX / containerWidth) * 100);

      if (newLeftWidth >= 25 && newLeftWidth <= 75) {
        setBarPostion(newLeftWidth);
        setLeftWidth(newLeftWidth);
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    // get the html representation of the diff:
    const getData = async () => {
      /* eslint-disable no-unused-vars */

      let [wikEdDiffHtml, aHtml, bHtml] = booksAlignment?.s1
        ? await kitabDiff(
            cleanImech(booksAlignment?.s1),
            cleanImech(booksAlignment?.s2),
            bookIntoRows // true/false
          )
        : ["", "", ""];

      // store the kitabDiff output in memory
      setWikiDiffBook(wikEdDiffHtml);
      setParsedBookAlignment({
        s1: aHtml,
        s2: bHtml,
        beforeAlignment1: booksAlignment?.beforeAlignment1,
        afterAlignment1: booksAlignment?.afterAlignment1,
        beforeAlignment2: booksAlignment?.beforeAlignment2,
        afterAlignment2: booksAlignment?.afterAlignment2,
      });
    };
    getData();
  }, [setBooksAlignment, booksAlignment, bookIntoRows]);

  return (
    <>
      <SectionHeader
        item={{ title: "Books Alignment", icon: "fa-solid fa-book-open" }}
      >
        <BookAlignmentHeader />
      </SectionHeader>
      <WikiEdDiffModal data={wikiDiffBook} />

      <Box
        padding={"20px"}
        fontSize={"20px"}
        sx={{ position: "relative" }}
        ref={bookAlignmentRef}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Box width={`${leftWidth}%`} pr="20px" textAlign="right">
          <Box
            display={"flex"}
            height={"50px"}
            width={"100%"}
            bgcolor={"#f3f4f6"}
            mb={1}
            borderRadius={"5px"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box px={"10px"}>
              <Typography variant="body1">
                {isFlipped
                  ? books?.book2?.ms && (
                      <span>
                        Book 2: {books?.book2?.title}{" "}
                        {`(milestone ${books?.book2?.ms})`}
                      </span>
                    )
                  : books?.book1?.ms && (
                      <span>
                        Book 1: {books?.book1?.title}{" "}
                        {`(milestone ${books?.book1?.ms})`}
                      </span>
                    )}
              </Typography>
            </Box>
          </Box>
          <ParsedBook parsedBookAlignment={parsedBookAlignment} isLeft />
        </Box>
        <Box
          onMouseDown={handleResizer}
          width={"8px"}
          height={"85%"}
          position={"absolute"}
          top={"50%"}
          sx={{
            transform: "translate(-50%, -50%)",
            cursor: "col-resize",
          }}
          left={`${barPositon}%`}
          mt={"10px"}
          bgcolor={"#d1d5db"}
          borderRadius={"50px"}
        ></Box>
        <Box width={`${100 - leftWidth}%`} pl="20px" textAlign="right">
          <Box
            display={"flex"}
            height={"50px"}
            width={"100%"}
            bgcolor={"#f3f4f6"}
            mb={1}
            borderRadius={"5px"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box px={"10px"}>
              <Typography variant="body1">
                {isFlipped
                  ? books?.book1?.ms && (
                      <span>
                        Book 1: {books?.book1?.title}{" "}
                        {`(milestone ${books?.book1?.ms})`}
                      </span>
                    )
                  : books?.book2?.ms && (
                      <span>
                        Book 2: {books?.book2?.title}{" "}
                        {`(milestone ${books?.book2?.ms})`}
                      </span>
                    )}
              </Typography>
            </Box>
          </Box>
          <ParsedBook parsedBookAlignment={parsedBookAlignment} />
        </Box>
      </Box>
    </>
  );
};

export default BooksAlignment;
