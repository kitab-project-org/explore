import { Box, Button, IconButton, Typography } from "@mui/material";
import { useContext, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
    bookIntoRows,
    nRefineChars,
    nSharedChars,
    normalizeAlif,
    normalizeYa,
    normalizeHa,
    removePunct,
    removeTags,
    textAvailable,
    initialAlignmentIndex,
    setInitialAlignmentIndex,
  } = useContext(Context);
  const [, setSearchParams] = useSearchParams();
  const [toggle, setToggle] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Reset to first alignment on new dot click, or to the URL-requested index on initial load:
  useEffect(() => {
    if (initialAlignmentIndex !== null) {
      setCurrentIndex(initialAlignmentIndex);
      setInitialAlignmentIndex(null);
    } else {
      setCurrentIndex(0);
    }
    console.log("RESETTING currentIndex to 0 in Books/index.js");
  }, [booksAlignment]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync currentIndex → URL param (align_no) on user navigation.
  useEffect(() => {
    if (booksAlignment.length === 0) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (currentIndex > 0) {
        next.set("align_no", (currentIndex + 1).toString());
      } else {
        next.delete("align_no");
      }
      return next;
    }, { replace: true });
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentAlignment = useMemo(
    () => booksAlignment[currentIndex] ?? {},
    [booksAlignment, currentIndex]
  );

  useEffect(() => {
    // get the html representation of the diff:
    let cancelled = false;
    const getData = async () => {
      /* eslint-disable no-unused-vars */

      let [wikEdDiffHtml, aHtml, bHtml] = currentAlignment?.s1
        ? await kitabDiff(
            cleanBeforeDiff(
              currentAlignment?.s1,
              normalizeAlif,
              normalizeYa,
              normalizeHa,
              removePunct,
              removeTags
            ),
            cleanBeforeDiff(
              currentAlignment?.s2,
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

      if (cancelled) return;
      // store the kitabDiff output in the state:
      setWikiDiffBook(wikEdDiffHtml);
      setParsedBookAlignment({
        s1: aHtml,
        s2: bHtml,
        beforeAlignment1: currentAlignment?.beforeAlignment1 ?? "",
        afterAlignment1: currentAlignment?.afterAlignment1 ?? "",
        beforeAlignment2: currentAlignment?.beforeAlignment2 ?? "",
        afterAlignment2: currentAlignment?.afterAlignment2 ?? "",
      });
    };
    getData();
    return () => { cancelled = true; };
  }, [
    currentAlignment,
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
            sx={{
              px: { xs: "0px", md: "20px" },
              pb: "20px",
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

                {/* Navigation between multiple alignments for the same dot,
                    styled to sit flush above the DiffGrid header */}
                {booksAlignment.length > 1 && (
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    bgcolor: "#f0f0f5",
                  }}>
                    <IconButton
                      onClick={() => setCurrentIndex(i => i - 1)}
                      disabled={currentIndex === 0}
                      size="small"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </IconButton>
                    <Typography variant="body2">
                      Alignment {currentIndex + 1} of {booksAlignment.length}
                    </Typography>
                    <IconButton
                      onClick={() => setCurrentIndex(i => i + 1)}
                      disabled={currentIndex === booksAlignment.length - 1}
                      size="small"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </IconButton>
                  </Box>
                )}

                {/* The table in which the split diff is displayed: */}
                <DiffGrid
                  chartSpecificBar={chartSpecificBar}
                  parsedBookAlignment={parsedBookAlignment}
                  isLeft={false}
                  alignmentOnly={alignmentOnly}
                  currentMs2={currentAlignment?.ms2}
                  bc1={currentAlignment?.bc1}
                  ec1={currentAlignment?.ec1}
                  bc2={currentAlignment?.bc2}
                  ec2={currentAlignment?.ec2}
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
