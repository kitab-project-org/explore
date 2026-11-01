import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material";
import MileStone from "./MileStone";
import ParsedBook from "../../BooksAlignment/ParsedBook";
import { imechToHtml } from "../../../../utility/Helper";

const Contents = ({
  data,
  fullWidth,
  fontSize,
  bookNumber,
  parsedBookAlignment,
  isLeft,
  alignmentOnly,
}) => {
  const ref = useRef();
  //const { alignmentOnly } = useContext(Context);
  const [contentBefore, setContentBefore] = useState({});
  const [contentAfter, setContentAfter] = useState({});
  const [bottomLoader, setBottomLoader] = useState(false);
  const [topLoader, setTopLoader] = useState(false);
  const [bottomEnd, setBottomEnd] = useState(false);
  const [topEnd, setTopEnd] = useState(false);
  console.log("Entering Contents function");
  console.log("Contents: alignmentOnly: " + alignmentOnly);

  // show the next milestone of the text (downloaded from i.mech)
  // TO DO: load more milestones if the next milestone is not yet downloaded
  const loadNextMilestone = () => {
    // get the last milestone number of the currently displayed milestones:
    console.log(Object.keys(contentAfter));
    const lastDisplayedMs =
      Object.keys(contentAfter)[Object.keys(contentAfter).length - 1] ||
      data.ms;
    // get the number of the last milestone downloaded from i.mech:
    const lastDownloadedMs = Object.keys(data?.content)[
      Object.keys(data?.content).length - 1
    ];
    // get the next milestone from the available milestones:
    const nextMs = Object.keys(data?.content).filter((item) => {
      return Number(item) === Number(lastDisplayedMs) + 1;
    });
    console.log("lastDisplayedMs: ", lastDisplayedMs);
    console.log("lastDownloadedMs: ", lastDownloadedMs);
    console.log("nextMs: ", nextMs);

    // display the next milestone if there is one:
    if (nextMs.length === 1) {
      const newMs = imechToHtml(data?.content[Number(lastDisplayedMs) + 1]);
      console.log("newMs: ");
      console.log(newMs);
      setBottomLoader(true);
      setTimeout(() => {
        if (Number(lastDisplayedMs) + 1 === lastDownloadedMs) {
          setBottomEnd(true);
        }
        setContentAfter({
          ...contentAfter,
          [Number(lastDisplayedMs) + 1]: newMs,
        });
        setBottomLoader(false);
      }, 300);
    } else {
      setBottomEnd(true);
      console.log("REACHED THE END OF THE DOWNLOADED MILESTONES");
    }
  };

  // show the previous milestone of the text (downloaded from i.mech)
  // TO DO: load more milestones if the previous milestone is not yet downloaded
  const loadPreviousMilestone = () => {
    // get the first milestone number of the currently displayed milestones:
    const firstDisplayedMs = Object.keys(contentBefore)[0] || data.ms;
    // get the number of the last milestone downloaded from i.mech:
    const firstDownloadedMs = Object.keys(data?.content)[0];
    // get the next milestone from the available milestones:
    const prevMs = Object.keys(data?.content).filter((item) => {
      return Number(item) === Number(firstDisplayedMs) - 1;
    });
    console.log("firstDisplayedMs: ", firstDisplayedMs);
    console.log("firstDownloadedMs: ", firstDownloadedMs);
    console.log("prevMs: ", prevMs);

    // display the next milestone if there is one:
    if (prevMs.length === 1) {
      const newMs = imechToHtml(data?.content[Number(firstDisplayedMs) - 1]);
      setTopLoader(true);
      setTimeout(() => {
        if (Number(firstDisplayedMs) - 1 === firstDownloadedMs) {
          setTopEnd(true);
        }
        setContentBefore({
          ...contentBefore,
          [Number(firstDisplayedMs) - 1]: newMs,
        });
        setTopLoader(false);
      }, 300);
    } else {
      setTopEnd(true);
      console.log("REACHED THE END OF THE DOWNLOADED MILESTONES");
    }
  };

  useEffect(() => {
    if (ref?.current) {
      ref.current.scrollTop = 0;
    }
    // empty the content object:
    setContentBefore({});
    setContentAfter({});

    let initialData = {};
    /*
    // add the previous milestone to the content object:
    initialData[Number(data?.ms) - 1] =
      data?.content[`${Number(data?.ms) - 1}`];
    */
    // add the current milestone to the content object:
    //initialData[Number(data?.ms)] = data?.content[data?.ms];
    /*
    // add the next milestone to the content object:
    initialData[Number(data?.ms) + 1] =
      data?.content[`${Number(data?.ms) + 1}`];
    */
    // store the selected milestones in the state:
    setContentBefore(initialData);
    setContentAfter(initialData);
  }, [data]);

  console.log(parsedBookAlignment);
  let beforeAlignment =
    bookNumber === 1
      ? parsedBookAlignment.beforeAlignment1
      : parsedBookAlignment.beforeAlignment2;
  beforeAlignment = imechToHtml(beforeAlignment);
  let afterAlignment =
    bookNumber === 1
      ? parsedBookAlignment.afterAlignment1
      : parsedBookAlignment.afterAlignment2;
  afterAlignment = imechToHtml(afterAlignment);

  console.log("rendering Contents component");

  return (
    <Box
      mb={fullWidth ? null : 3}
      p={fullWidth ? "30px" : "0px 20px"}
      textAlign={"right"}
      height={fullWidth ? "max-content" : 400}
      overflow={"hidden"}
      sx={{
        overflowY: "scroll",
        direction: "rtl",
      }}
      ref={ref}
      className="bookContents"
    >
      {topLoader && !alignmentOnly && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "max-content",
            py: "10px",
            pb: "20px",
          }}
        >
          <CircularProgress size={30} />
        </Box>
      )}
      {!(fullWidth || topEnd || alignmentOnly) && (
        <div>
          {!topLoader && (
            <Button
              sx={{ width: "100%", mb: "5px" }}
              onClick={loadPreviousMilestone}
            >
              Load Previous Milestone
            </Button>
          )}
        </div>
      )}

      {!alignmentOnly &&
        Object.keys(fullWidth ? data?.content : contentBefore)
          .filter((item) => {
            return parseInt(item) < data?.ms;
          })
          .map((item, i) => (
            <div key={i}>
              <MileStone
                fullWidth={fullWidth}
                data={data}
                content={contentBefore}
                fontSize={fontSize}
                item={item}
                bookNumber={bookNumber}
              />
            </div>
          ))}

      {!(fullWidth || alignmentOnly) && (
        <>
          <Typography
            sx={{
              pr: "10px",
              //bgcolor: Number(data?.ms) === Number(item) ? "lightgreen" : "",
            }}
            fontSize={fullWidth ? `${fontSize}px` : "20px"}
            dangerouslySetInnerHTML={{ __html: beforeAlignment }}
          />
          <Divider />
        </>
      )}
      <ParsedBook parsedBookAlignment={parsedBookAlignment} isLeft={isLeft} />

      {!(fullWidth || alignmentOnly) && (
        <>
          <Divider />

          <Typography
            sx={{
              pr: "10px",
              //bgcolor: Number(data?.ms) === Number(item) ? "lightgreen" : "",
            }}
            fontSize={fullWidth ? `${fontSize}px` : "20px"}
            dangerouslySetInnerHTML={{ __html: afterAlignment }}
          />
        </>
      )}
      {!(fullWidth || alignmentOnly) &&
        Object.keys(contentAfter)
          .filter((item) => {
            return parseInt(item) > data?.ms;
          })
          .map((item, i) => (
            <div key={i}>
              <MileStone
                fullWidth={fullWidth}
                data={data}
                content={contentAfter}
                fontSize={fontSize}
                item={item}
                bookNumber={bookNumber}
              />
            </div>
          ))}
      {!fullWidth && bottomEnd && !alignmentOnly && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "max-content",
            py: "60px",
          }}
        >
          <Typography fontWeight={600} variant="h5">
            End Of The Book
          </Typography>
        </Box>
      )}

      {!(fullWidth || bottomEnd || alignmentOnly) && (
        <div>
          {!bottomLoader && (
            <Button
              sx={{ width: "100%", mt: "5px" }}
              onClick={loadNextMilestone}
            >
              Load Next Milestone
            </Button>
          )}
        </div>
      )}
      {!fullWidth && !alignmentOnly && bottomLoader && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "max-content",
            py: "10px",
            pb: "20px",
          }}
        >
          <CircularProgress size={30} />
        </Box>
      )}
    </Box>
  );
};

export default Contents;
