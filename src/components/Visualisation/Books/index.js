import { Box, Button } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import DiffGrid from "./DiffGrid";
import WikiEdDiffModal from "../BooksAlignment/WikiEdDiffModal";
import CircularInterminate from "../CircularIndeterminate";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import BookAlignmentHeader from "../SectionHeader/BookAlignmentHeader";
import { kitabDiff } from "../../../assets/js/kitabDiff";
import { cleanBeforeDiff } from "../../../utility/Helper";
import { Context } from "../../../App";

const Books = ({ chartSpecificBar }) => {
  const {
    bookSectionRef,
    dataLoading,
    booksAlignment,
    setBooksAlignment,
    bookIntoRows,
    nRefineChars,
    nSharedChars,
    normalizeAlif,
    normalizeYa,
    normalizeHa,
    removePunct,
    removeTags,
    textAvailable
  } = useContext(Context);
  const [toggle, setToggle] = useState(true);
  const [wikiDiffBook, setWikiDiffBook] = useState("");
  const [parsedBookAlignment, setParsedBookAlignment] = useState({
    s1: "",
    s2: "",
    beforeAlignment1: "",
    afterAlignment1: "",
    beforeAlignment2: "",
    afterAlignment2: "",
  });
  const [alignmentOnly, setAlignmentOnly] = useState(true);

  // toggle the context around the alignment:
  const loadMilestoneContext = () => {
    setAlignmentOnly(!alignmentOnly);
  };

  // variables and functions related to the modal and resizer:
  // (temporarily disabled)
  /*
  const [open, setOpen] = useState(false);
  const [expandViewData, setExpandViewData] = useState({
    data: {},
    bookNumber: null,
    ms: "",
  });
  const [leftWidth, setLeftWidth] = useState(50);
  const [barPositon, setBarPostion] = useState(50);

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
      isLeft: isLeft,
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
    console.log("EXITING. To books?");
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
  */

  useEffect(() => {
    // get the html representation of the diff:
    const getData = async () => {
      /* eslint-disable no-unused-vars */

      let [wikEdDiffHtml, aHtml, bHtml] = booksAlignment?.s1
        ? await kitabDiff(
            cleanBeforeDiff(
              booksAlignment?.s1,
              normalizeAlif,
              normalizeYa,
              normalizeHa,
              removePunct,
              removeTags
            ),
            cleanBeforeDiff(
              booksAlignment?.s2,
              normalizeAlif,
              normalizeYa,
              normalizeHa,
              removePunct,
              removeTags
            ),
            bookIntoRows, // true/false
            nSharedChars,
            nRefineChars
          )
        : ["", "", ""];

      // store the kitabDiff output in the state:
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
  }, [
    setBooksAlignment,
    booksAlignment,
    bookIntoRows,
    nRefineChars,
    nSharedChars,
    normalizeAlif,
    normalizeYa,
    normalizeHa,
    removePunct,
    removeTags,
  ]);

  return (
    <>
      <SectionHeaderLayout
        item={{
          title: "Books",
          icon: "fa-solid fa-book",
        }}
        toggle={toggle}
        setToggle={setToggle}
      >
        <BookAlignmentHeader />
      </SectionHeaderLayout>
      {toggle && (
        <>
          <Box
            ref={bookSectionRef}
            id="bookSectionRef"
            position={"relative"}
            display={"flex"}
            justifyContent={"space-between"}
            sx={{
              p: {
                xs: "0px",
                md: "20px",
              },
              py: "20px",
            }}
          >
            {dataLoading?.books ? (
              // Display spinner while the books are loading:
              <CircularInterminate />
            ) : (
              // Once books have loaded, display the diff:
              <>
                {/* The modal in which the inline diff is displayed: */}
                <WikiEdDiffModal data={wikiDiffBook} />

                {/* The table in which the split diff is displayed: */}
                <DiffGrid
                  chartSpecificBar={chartSpecificBar}
                  parsedBookAlignment={parsedBookAlignment}
                  isLeft={false}
                  alignmentOnly={alignmentOnly}
                />
              </>
            )}
          </Box>
          {/* Button for showing / hiding the context of the alignment */}
          {textAvailable &&
            (<Box>
              <Button
                sx={{ width: "100%", mt: "5px" }}
                onClick={loadMilestoneContext}
              >
                {alignmentOnly ? "LOAD CONTEXT" : "HIDE CONTEXT"}
              </Button>
            </Box>)
          }
        </>
      )}
    </>
  );
};

export default Books;
