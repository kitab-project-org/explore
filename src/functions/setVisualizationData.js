import Papa from "papaparse";
import { getHighestValueInArrayOfObjects } from "../utility/Helper"

// turn a list of keys into a function that selects objects based on those keys:
function itemGetter(keys) {
  return function (obj) {
    return keys.map((key) => obj[key]);
  };
}

/**
 * @description
 * Takes an Array of objects, and a list of keys,
 * and returns an array in which objects with the same values
 * for the given keys are grouped together.
 * The new objects will have only the keys by which they are grouped,
 * and a new key whose value is an array of objects containing the remaining keys.
 *
 * @param {Array} list An array of objects.
 * @param {Array} groupByKeys An array of keys (Strings) by which the objects should be grouped.
 * @param {String} newKey The name of the key under which the remaining keys (and their values)
 *               for each object in the group will be collected.
 *
 * @returns Map of the array grouped by the grouping function.
 */
// based on: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
function groupBy(
  list,
  groupByKeys,
  newKey = "alignments",
  sumKeys = ["ch_match"]
) {
  // create a function that will get only the specified keys from the object:
  const keyGetter = itemGetter(groupByKeys);

  // build a map of the array, based on the list of keys given
  const map = new Map();
  list.forEach((item) => {
    // build a key for the combination of the values of the groupByKeys in the current item:
    // (the key in the map must be a string for this to work):
    const key = JSON.stringify(keyGetter(item));
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  // convert the map into an array:
  const arr = [];
  for (const objArr of map.values()) {
    const rowObj = {};
    // get the common values for the row:
    groupByKeys.forEach((k) => {
      rowObj[k] = objArr[0][k];
    });
    // collect the key-value pairs that are different for each object in the row into an array:
    const itemArr = [];
    objArr.forEach((item) => {
      groupByKeys.forEach((k) => {
        delete item[k];
      });
      itemArr.push(item);
    });
    rowObj[newKey] = itemArr;
    // sum up the values for the relevant keys in each object in itemArr
    // and add the sum to the rowObj:
    sumKeys.forEach((k) => {
      rowObj[k] = itemArr.reduce((total, obj) => obj[k] + total, 0);
    });
    arr.push(rowObj);
  }
  return arr;
}

function prepareMsData(
  msData,
  mainBookMilestones,
  mainBookID,
  bookIndexDict,
  bookUriDict
) {
  // calculate statistics per milestone:
  let msStats = {}; // number of reused characters per milestone
  let msBooks = {}; // number of reused books per milestone
  for (var i = 0; i < msData.length; i++) {
    // add unique ID field for each row:
    msData[i]["id"] = i;
    // add the length of the alignment in book 2 to the aggregator for ms1:
    msStats[msData[i]["ms1"]] =
      (msStats[msData[i]["ms1"]] || 0) + msData[i]["ch_match"];
    // count the number of books that have text reuse for ms1:
    msBooks[msData[i]["ms1"]] = (msBooks[msData[i]["ms1"]] || 0) + 1;
  }

  // convert msStats Object into an array of objects:
  msStats = Object.keys(msStats).map((key) => ({
    ms_id: parseInt(key),
    ch_match_total: msStats[key],
  }));

  // group the msData array by the ms1 and id2 values
  // (so that if multiple milestones of book2 reuse (parts of)
  // the same milestones in the main book, the numbers are aggregated);
  // the objects in the new array will have four keys:
  // ms1, id2, ch_match and alignments;
  //   ch_match will contain the sum of the ch_match for all milestones in id2 that reuse ms1;
  //   alignments will contain an array of objects with keys b1,e1,b2,e2,ch_match,matches_percent
  msData = groupBy(msData, ["ms1", "id2"], "alignments", ["ch_match"]);

  // add dummy rows for each milestone in the main book,
  // so that each milestone in the main book is displayed
  // as a black dot in the graph:
  let maxChMatch = msData.reduce((a, b) =>
    a.ch_match > b.ch_match ? a : b
  ).ch_match;
  let last_i = msData.length - 1;
  for (let i = 1; i <= mainBookMilestones; i++) {
    msData.push({
      ms1: i,
      alignments: [],
      id2: mainBookID,
      e2: maxChMatch,
      ch_match: maxChMatch,
      id: last_i + i + 1,
    });
  }

  // add bookIndex + date to the msData array
  // (bookIndex is the X value for the book; date can be used to filter the array later):
  for (let i = 0; i < msData.length; i++) {
    try {
      msData[i]["bookIndex"] = bookIndexDict[msData[i]["id2"]];
      msData[i]["date"] = parseInt(
        bookUriDict[msData[i]["id2"]][0].substring(0, 4)
      );
    } catch (error) {}
  }
  return [msData, msStats, msBooks];
}

function prepareStats(stats, mainBookID, mainBookURI, mainBookMilestones) {
  // add stats of the main book to the stats array:
  stats.push({
    id: mainBookID,
    book: mainBookURI,
    alignments: mainBookMilestones,
    ch_match: 0,
  });

  // sort the stats by book URI:
  stats.sort((a, b) => (a.book > b.book ? 1 : b.book > a.book ? -1 : 0));

  // add date and book_index fields and create dictionaries:
  var bookIndexDict = {}; // keys: versionID, values: bookIndex
  var bookUriDict = {}; // keys: versionID, values: textURI
  for (var i = 0; i < stats.length; i++) {
    stats[i]["bookIndex"] = i + 1;
    bookIndexDict[stats[i]["id"]] = stats[i]["bookIndex"];
    bookUriDict[stats[i]["id"]] = [stats[i]["book"]];
    let date = parseInt(stats[i]["book"].substring(0, 4));
    stats[i]["date"] = date;
  }
  return [stats, bookIndexDict, bookUriDict];
}

export const setPairwiseVizData = (values) => {
  console.log("LOADING PAIRWISE DATA");

  const {
    book1,
    book2,
    CSVFile,
    dataLoading,
    setDataLoading,
    setMetaData,
    releaseCode,
    getMetadataObject,
    setChartData,
    setIsError,
    setIsFileUploaded,
    navigate,
    csvFileName,
    setUrl,
  } = values;

  if (book1 && book2) {
    try {
      // create metadata object for both books and store it:
      setMetaData(getMetadataObject(book1, book2, releaseCode));
      setDataLoading({ ...dataLoading, metadata: false });

      /**
       * parse tsv data into an array of objects
       * 
       * Checks if the csv data is in new or old passim format,
       * converts the new format into old format,
       * removes unused key-value pairs,
       * and sets the chart data:
       * 
       * old		          	old(light)			new
       * b1			          b1						begin1
       * b2			          b2						begin2
       * bw1			          bw1						x
       * bw2		          	bw2						x
       * e1		          	e1						end1
       * e2		          	e2						end2
       * ew1		          	ew1						x
       * ew2		          	ew2						x
       * seq1	          	seq1					seq1
       * seq2	          	seq2					seq2
       * s1		          	x						  s1
       * s2		          	x						  s2
       * id1		          	x						  id1
       * first1          	x						  x
       * uid1	          	x						  uid
       * len1	          	x						  x
       * tok1	          	x						  x
       * gid1	          	x						  gid
       * id2			          x						  id2
       * first2	          x						  x
       * uid2		          x						  uid2
       * len2		          x						  x
       * tok2		          x						  x
       * gid2		          x						  gid2
       * matches	          x						  matches
       * score		          x						  x
       * ch_match		    	x						  ch_match
       * align_len			    x						  align_len
       * matches_percent		x						  matches_percentage
       * w_match			      x						  w_match
       * series_b1			    x						  series_b1
       * series_b2			    x						  series_b2
       */
      const parseTSVData = async () => {
        // parse pairwise csv file:
        Papa.parse(CSVFile, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // should convert numeric fields to integers
          complete: (result) => {
            const old_format = result.data[0].hasOwnProperty("bw2");
            let cleanedData;
            if (old_format) {
              cleanedData = result.data.map(({bw1, bw2, ew1, ew2, s1, s2, seq1, seq2, ...rest}) => ({
                bw1,
                bw2,
                ew1,
                ew2,
                s1: s1 || "text unavailable",   // will be undefined for "light" text reuse data files
                s2: s2 || "text unavailable",   // will be undefined for "light" text reuse data files
                seq1, 
                seq2
              }));;
            } else {
              let origData = result.data;
              // calculate the highest end character for book1 and book2:
              const book1EndMax = getHighestValueInArrayOfObjects(origData, "end");
              const book2EndMax = getHighestValueInArrayOfObjects(origData, "end2");
              // use the largest of these as 100% milestone length
              const msMax = Math.max(book1EndMax, book2EndMax);
              // recalculate the relevant values:
              cleanedData = origData.map(({begin, begin2, end, end2, s1, s2, seq, seq2, ...rest}) => ({
                b1: begin,
                b2: begin2,
                e1: end,
                e2: end2,
                bw1: parseInt(begin * 300 / msMax),  // estimated token offsets
                bw2: parseInt(begin2 * 300 / msMax),
                ew1: parseInt(end * 300 / msMax),
                ew2: parseInt(end2 * 300 / msMax),
                s1, 
                s2, 
                seq1: seq,
                seq2
              }));
            } 
            // pass the pairwise data to the Context:
            setChartData({
              tokens: {
                first: book1?.release_version?.tok_length,
                second: book2?.release_version?.tok_length,
              },
              dataSets: cleanedData,
            });
            setIsError(false);
            setDataLoading({ ...dataLoading, chart: false });
            const url = `/visualise/${releaseCode}/?books=${csvFileName.replace(
              ".csv",
              ""
            )}`;
            setUrl(url);
            // Load the URL (which will load the chart):
            navigate(url);
          },
          error: (error) => {
            setDataLoading({ ...dataLoading, uploading: false });
            setIsError(true);
          },
        });
      };
      parseTSVData();
      setIsFileUploaded(true);
      setDataLoading({
        ...dataLoading,
        uploading: false,
        chart: false,
        metadata: false,
      });
    } catch (err) {
      setDataLoading({ ...dataLoading, uploading: false, metadata: false });
      setIsError(true);
    }
  } else {
    setDataLoading({ ...dataLoading, uploading: false, metadata: false });
    setIsError(true);
  }
};

export const setMultiVizData = (values) => {
  console.log("LOADING ONE TO MANY DATA");
  const {
    book1,
    msdataFile,
    statsFile,
    dataLoading,
    setDataLoading,
    setMetaData,
    releaseCode,
    getMetadataObject,
    setChartData,
    setIsError,
    setIsFileUploaded,
    setUrl
  } = values;
  if (book1) {
    try {
      // create metadata object for both books and store it:
      setMetaData(getMetadataObject(book1, null, releaseCode));
      setDataLoading({ ...dataLoading, metadata: false });

      // Parse the CSV files and set the chart data:
      const parseCSVData = async (msdataFile, statsFile, book1) => {
        // calculate the last milestone number in the main book:
        let mainBookMilestones = Math.ceil(
          book1.release_version.tok_length / 300
        );
        let mainBookID = book1.version_code;
        let mainBookURI = book1.text.text_uri;

        // parse msdata csv file
        // (contains all text reuse data for book 1, arranged per milestone):
        let msData, msStats, msBooks, stats, bookIndexDict, bookUriDict;
        Papa.parse(msdataFile, {
          header: true,
          dynamicTyping: true, // converts numeric fields to integers
          skipEmptyLines: true,
          complete: (result) => {
            // parse stats csv file
            // (contains text reuse stats for book 1, arranged per book2):
            Papa.parse(statsFile, {
              header: true,
              dynamicTyping: true, // should convert numeric fields to integers
              skipEmptyLines: true,
              complete: (result2) => {
                // format statsData and create dictionaries
                let statsData = result2.data;
                [stats, bookIndexDict, bookUriDict] = prepareStats(
                  statsData,
                  mainBookID,
                  mainBookURI,
                  mainBookMilestones
                );

                // format msData and calculate milestone stats:
                [msData, msStats, msBooks] = prepareMsData(
                  result.data,
                  mainBookMilestones,
                  mainBookID,
                  bookIndexDict,
                  bookUriDict
                );

                // pass the one-to-many data to the Context:
                setChartData({
                  versionCode: book1?.version_code,
                  tokens: { first: book1?.release_version?.tok_length },
                  msData: msData,
                  msStats: msStats,
                  msBooks: msBooks,
                  bookStats: stats,
                  bookIndexDict: bookIndexDict,
                  bookUriDict: bookUriDict,
                  /*filteredMsData: msData,
                filteredMsStats: msStats,
                filteredBookStats: stats*/
                  //dataSets: []
                });
                setIsError(false);
                setDataLoading({ ...dataLoading, chart: false });
                const url = `/visualise/${releaseCode}/?books=${book1?.version_code}_all`;
                setUrl(url);
              },
              error: (error) => {
                setDataLoading({ ...dataLoading, uploading: false });
                setIsError(true);
              },
            });
          },
          error: (error) => {
            setDataLoading({ ...dataLoading, uploading: false });
            setIsError(true);
          },
        });
      };
      parseCSVData(msdataFile, statsFile, book1);
      setIsFileUploaded(true);
      setDataLoading({ ...dataLoading, uploading: false, chart: false });
    } catch (err) {
      setDataLoading({ ...dataLoading, uploading: false });
      setIsError(true);
    }
  } else {
    setDataLoading({ ...dataLoading, uploading: false });
    setIsError(true);
  }
};
