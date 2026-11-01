import { useContext } from "react";
// import { useNavigate } from "react-router-dom";

import TextReuseTable from "./TextReuseTable";
import { Context } from "../../../../../App";
// import { lightSrtFolders, srtFoldersGitHub } from "../../../../../assets/srtFolders";
// import { getMetadataObject } from "../../../../../functions/getMetadataObject";
// import { setPairwiseVizData } from "../../../../../functions/setVisualizationData";
import { setInitialValues } from "../../../../../functions/setInitialValues";
// import { downloadCsvData } from "../../../../../services/TextReuseData";
import { loadChartFromUrl } from "../../../../../utility/Helper";

// Text Reuse Data tab in the drawer:
const TextReuseData = ({ fullData, query, fullDataLoading }) => {
  // const navigate = useNavigate();
  const {
    setMetaData,
    setChartData,
    // setLoadedCsvFile,
    dataLoading,
    setDataLoading,
    setBooks,
    setIsOpenDrawer,
    releaseCode,
    setIsFileUploaded,
    setBooksAlignment,
    // setIsError,
    // setUrl,
  } = useContext(Context);

  // load chart in new window - built from the old function that loaded it into the window
  const handleRedirectToChart = async ({book1, book2, csvUrl}) => {
    setInitialValues({
      dataLoading,
      setIsFileUploaded,
      setDataLoading,
      setMetaData,
      setChartData,
      setBooksAlignment,
      setBooks,
    });

    const idPair = csvUrl.split("/").pop();

    // load the chart in a new tab
    await loadChartFromUrl(releaseCode, idPair);
    // close the drawer
    setIsOpenDrawer(false);
  };

  // Original function that loaded the viz into the same window
  // // redirect to chart page
  // const handleRedirectToChart = async ({book1, book2, csvUrl}) => {
  //   setInitialValues({
  //     dataLoading,
  //     setIsFileUploaded,
  //     setDataLoading,
  //     setMetaData,
  //     setChartData,
  //     setBooksAlignment,
  //     setBooks,
  //   });

  //   // generate csv file name
  //   const csvFileName = csvUrl.split("/").pop();

  //   // get book names
  //   const book_names = csvFileName.split("_");

  //   if (book_names[0] && book_names[1]) {
  //     /*// downloading pairwise text reuse is not necessary: 
  //     // already downloaded in drawer:
  //     const versionMeta = await getVersionMeta(releaseCode, book_names);
  //     const book1 = versionMeta.book1;
  //     const book2 = versionMeta.book2;*/

  //     // First try to download from KITAB webserver:
  //     let passim_folder = lightSrtFolders[releaseCode];
  //     let url = `${passim_folder}/${book_names[0]}/${csvFileName}`;
  //     let CSVFile = await downloadCsvData(url);
  //     // if this fails: try to download from GitHub:
  //     if (CSVFile instanceof Error) {
  //       passim_folder = srtFoldersGitHub[releaseCode];
  //       url = `${passim_folder}/${book_names[0]}/${csvFileName}`;
  //       CSVFile = await downloadCsvData(url);
  //     }

  //     // store the loaded csv file in memory (context):
  //     setLoadedCsvFile(CSVFile);

  //     // load pairwise visualisation:
  //     setPairwiseVizData({
  //       book1,
  //       book2,
  //       CSVFile,
  //       dataLoading,
  //       setDataLoading,
  //       setMetaData,
  //       releaseCode,
  //       getMetadataObject,
  //       setChartData,
  //       setIsError,
  //       setIsFileUploaded,
  //       navigate,
  //       csvFileName,
  //       setUrl,
  //     });
  //   } else {
  //     setDataLoading({ ...dataLoading, uploading: false });
  //     setIsError(true);
  //   }
  //   setIsOpenDrawer(false);
  // };

  return (
    <TextReuseTable
      b1Metadata={fullData}
      normalizedQuery={query.toLowerCase().trim()}
      handleRedirectToChart={handleRedirectToChart}
      b1MetadataLoading={fullDataLoading}
    />
  );
};

export default TextReuseData;
