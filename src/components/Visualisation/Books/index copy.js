import { useContext, useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import ExpandView from "./ExpandView";
import Book from "./Book";
import CircularInterminate from "../CircularIndeterminate";
import WikiEdDiffModal from "../BooksAlignment/WikiEdDiffModal";
import { kitabDiff } from "../../../assets/js/kitabDiff";
import { cleanImech } from "../../../utility/Helper";
import { Context } from "../../../App";


const Books = ({ chartSpecificBar }) => {
  const { 
    bookSectionRef, 
    focusMilestone1, 
    focusMilestone2, 
    dataLoading, 
    booksAlignment, 
    setBooksAlignment, 
    bookIntoRows
  } = useContext(Context);

  const [open, setOpen] = useState(false);
  const [wikiDiffBook, setWikiDiffBook] = useState("");
  const [parsedBookAlignment, setParsedBookAlignment] = useState({
    s1: "",
    s2: "",
    beforeAlignment1: "",
        afterAlignment1: "",
        beforeAlignment2: "",
        afterAlignment2: "",
  });
  const [expandViewData, setExpandViewData] = useState({
    data: {},
    bookNumber: null,
    ms: "",
  });
  const [leftWidth, setLeftWidth] = useState(50);
  const [barPositon, setBarPostion] = useState(50);
  const [alignmentOnly, setAlignmentOnly] = useState(true);

  const loadMilestoneContext = () => {
    setAlignmentOnly(!alignmentOnly);
  };

  const handleOpen = (bookNumber, ms, parsedBookAlignment, isLeft) => {
    console.log("OPENING!");
    console.log(bookNumber);
    console.log(ms);
    console.log(parsedBookAlignment);
    console.log(isLeft);
    console.log("-----");
    setExpandViewData({
      bookNumber: bookNumber,
      ms: ms,
      parsedBookAlignment: parsedBookAlignment, 
      isLeft: isLeft
    });
    console.log(expandViewData);
    setOpen(true);
    setTimeout(() => {
      if (focusMilestone1.current && bookNumber === 1) {
        focusMilestone1.current.scrollIntoView(true);
      }
      if (focusMilestone2.current && bookNumber === 2) {
        focusMilestone2.current.scrollIntoView(true);
      }
    }, 1000);
    console.log("EXITING. To books?")
  };

  const handleClose = () => setOpen(false);

  const handleResizer = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (bookSectionRef.current) {
      const containerWidth = bookSectionRef.current.offsetWidth;
      const layerX =
        e.clientX - bookSectionRef.current.getBoundingClientRect().left;
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
      
      let [wikEdDiffHtml, aHtml, bHtml] = (booksAlignment?.s1 ?
        await kitabDiff(
          cleanImech(booksAlignment?.s1),
          cleanImech(booksAlignment?.s2),
          bookIntoRows  // true/false
        ) :
        ["", "", ""]);

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

  console.log("rendering Books component");
  return (
    <>
      <Box
        padding={"20px"}
        ref={bookSectionRef}
        id="bookSectionRef"
        position={"relative"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        {dataLoading?.books ? (
          // Display spinner while the books are loading: 
          <CircularInterminate />
        ) : (
          // Once books have loaded, display the diff: 
          <>
            {/* The modal in which the inline diff is displayed: */}
            <WikiEdDiffModal data={wikiDiffBook} />

            {/* The modal in which 300 milestones can be read: */}
            <ExpandView
              open={open}
              handleClose={handleClose}
              data={expandViewData}
              alignmentOnly={alignmentOnly}
            />

            {/* Book 1 column: */}
            <Book
              leftWidth={leftWidth}
              chartSpecificBar={chartSpecificBar}
              handler={handleOpen}
              parsedBookAlignment={parsedBookAlignment}
              isLeft
              alignmentOnly={alignmentOnly}
            />

            {/* Separator between the two books that can be used to resize the books: */}
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

            {/* Book 2 column: */}
            <Book
              leftWidth={leftWidth}
              chartSpecificBar={chartSpecificBar}
              handler={handleOpen}
              parsedBookAlignment={parsedBookAlignment}
              isLeft={false}
              alignmentOnly={alignmentOnly}
            />
          </>
        )}
      </Box>
      
      {/* Button for showing / hiding the context of the alignment */}
      <Box>
        <Button
          sx={{ width: "100%", mt: "5px" }}
          onClick={loadMilestoneContext}
        >
          {alignmentOnly ? "LOAD CONTEXT" : "HIDE CONTEXT"}
        </Button>
      </Box>
    
    </>

  );
};

export default Books;
