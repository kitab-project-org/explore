import { useContext } from "react";
import { TableCell, Button } from "@mui/material";
import { getMilestoneText } from "../../../functions/getMilestoneText";
import { Context } from "../../../App";

// add the milestone number and its text contents to the displayMs variable
// (triggering the display of that milestone)
const NextMilestoneLoader = ({ alignmentOnly, books, bookNo, previous }) => {
  const {
    displayMs,
    setDisplayMs,
    downloadedTexts,
    setDownloadedTexts,
    releaseCode,
  } = useContext(Context);

  async function loadNextMs() {
    //console.log("Loading "+ (previous ? "previous" : "next") + " milestone for book no. "+bookNo);
    let versionCode =
      bookNo === 1 ? books.book1.versionCode : books.book2.versionCode;
    let milestoneTexts =
      bookNo === 1 ? books.book1.content : books.book2.content;
    if (
      milestoneTexts === undefined ||
      Object.keys(milestoneTexts).length === 0
    ) {
      if (downloadedTexts?.[releaseCode]?.[versionCode]?.["downloadedMs"]) {
        milestoneTexts =
          downloadedTexts[releaseCode][versionCode]["downloadedMs"]["msTexts"];
        //console.log(milestoneTexts);
      }
    }
    const currentMs = bookNo === 1 ? books.book1.ms : books.book2.ms;
    let allDisplayedMsNos = Object.keys(
      bookNo === 1 ? displayMs.book1 : displayMs.book2
    ).map(Number);

    const lastDisplayed = previous
      ? Math.min(...allDisplayedMsNos, currentMs)
      : Math.max(...allDisplayedMsNos, currentMs);
    const allMsNos = previous
      ? Object.keys(milestoneTexts)
          .sort((n1, n2) => parseInt(n1) - parseInt(n2))
          .reverse()
      : Object.keys(milestoneTexts).sort(
          (n1, n2) => parseInt(n1) - parseInt(n2)
        );
    let lastMsNo;
    for (const msNo of allMsNos) {
      lastMsNo = msNo;
      if (previous ? msNo < lastDisplayed : msNo > lastDisplayed) {
        console.log("next milestone to display: " + msNo);
        setDisplayMs((prev) => {
          let newDisplayMs = { ...prev }; // this is necessary for the ref to the object to change, triggering a rerender!
          if (bookNo === 1) {
            newDisplayMs.book1[msNo] = milestoneTexts[msNo];
            return newDisplayMs;
          } else {
            newDisplayMs.book2[msNo] = milestoneTexts[msNo];
            return newDisplayMs;
          }
        });
        return;
      }
    }
    // in case the milestone was not found in the list:
    // download a new batch of milestones!
    let msNo = previous ? parseInt(lastMsNo) - 1 : parseInt(lastMsNo) + 1;
    const msText = await getMilestoneText(
      releaseCode,
      versionCode,
      msNo,
      downloadedTexts,
      setDownloadedTexts
    );
    setDisplayMs((prev) => {
      let newDisplayMs = { ...prev }; // this is necessary for the ref to the object to change, triggering a rerender!
      if (bookNo === 1) {
        newDisplayMs.book1[msNo] = msText;
        return newDisplayMs;
      } else {
        newDisplayMs.book2[msNo] = msText;
        return newDisplayMs;
      }
    });
  }
  return (
    <TableCell align="center">
      <Button onClick={loadNextMs}>
        {previous ? "LOAD PREVIOUS MILESTONE" : "LOAD NEXT MILESTONE"}
      </Button>
    </TableCell>
  );
};

export default NextMilestoneLoader;
