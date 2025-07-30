import { config } from "../config";

const { ONE_TO_ALL_URL } = config;

/*
// get book1 and book 2 from text resuse data
export async function getTextReuseBooksTSV(release_code, book1, book2) {
    try {
      let RESOURCE = `${release_code}/text-reuse-stats`;
      let QUERY_PARAMS = `?book_1=${book1}&book_2=${book2}`;
  
      const res = await fetch(
        `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${RESOURCE}/${QUERY_PARAMS}`,
        { mode: "cors" }
      );
      const json = await res.json();
      return json;
    } catch (error) {
      return error;
    }
  }*/
  
  
// Download csv data from a webserver:
export async function downloadCsvData(url) {
  console.log("Downloading CSV data from "+url);
  try {
    const res = await fetch(url, { mode: "cors" });
    const data = await res.text();
    return data;
  } catch (error) {
    return error;
  }
}

// Download all text reuse data for one version, ordered per milestone:
export async function getOneBookMsData(openitiVersion, id1) {
  try {
    id1 = id1.split("-")[0];
    const msdataUrl = `${ONE_TO_ALL_URL}v${openitiVersion}/msdata/${openitiVersion}_${id1}_all.csv`
    const msdata = await downloadCsvData(msdataUrl);
    return msdata;
  } catch (error) {
    return error;
  }
}

// Download text reuse stats for one version:
export async function getOneBookReuseStats(openitiVersion, id1) {
  try {
    id1 = id1.split("-")[0];
    const statsUrl = `${ONE_TO_ALL_URL}v${openitiVersion}/stats/${openitiVersion}_${id1}_stats.csv`
    const stats = await downloadCsvData(statsUrl);
    return stats;
  } catch (error) {
    return error;
  }
}
  