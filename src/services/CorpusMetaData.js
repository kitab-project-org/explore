import { config } from "../config";

const { DEV_BASE_URL, PROD_BASE_URL, DEV_ENV } = config;

// filter data by search params
export async function getCorpusMetaData(
  page,
  pagesize,
  query,
  searchField,
  normalizedSearch,
  annotationFilter,
  orderBy,
  analysisPriority,
  releaseCode,
  advanceSearch
) {
  try {
    let QUERY_PARAMS = "";
    const filterString = () => {
      let str = "";
      str = annotationFilter?.notYetAnnotated
        ? str + "(not yet annotated),"
        : str;
      str = annotationFilter?.inProgress ? str + "inProgress," : str;
      str = annotationFilter?.completed ? str + "completed," : str;
      str = annotationFilter?.mARkdown ? str + "mARkdown," : str;
      if (str.endsWith(",")) {
        str = str.slice(0, -1); // Remove the last character (comma)
      }
      return str;
    };
    let annotationFilterQuery = annotationFilter
      ? `&annotation_status=${filterString()}`
      : "";
    let searchQuery =
      searchField && query
        ? `&${searchField === "title" ? "title_lat" : "author_lat"}=${query}`
        : query
        ? `&search=${query}`
        : "";
    let normalize = normalizedSearch ? `` : `&normalize=false`;
    let statusQuery = analysisPriority ? `` : "&analysis_priority=pri";
    let releaseCodeQuery = !releaseCode ? `` : `/${releaseCode}`;
    // let max_char_count =
    //   advanceSearch?.max_char_count === ""
    //     ? ``
    //     : `&char_count_lte=${advanceSearch?.max_char_count}`;
    // let min_char_count =
    //   advanceSearch?.min_char_count === ""
    //     ? ``
    //     : `&char_count_gte=${advanceSearch?.min_char_count}`;

    let max_tok_count =
      advanceSearch?.max_tok_count === ""
        ? ``
        : `&tok_count_lte=${advanceSearch?.max_tok_count}`;

    let min_tok_count =
      advanceSearch?.min_tok_count === ""
        ? ``
        : `&tok_count_gte=${advanceSearch?.min_tok_count}`;

    let editor =
      advanceSearch?.editor === "" ? `` : `&editor=${advanceSearch?.editor}`;

    let edition_place =
      advanceSearch?.edition_place === ""
        ? ``
        : `&edition_place=${advanceSearch?.edition_place}`;

    let publisher =
      advanceSearch?.publisher === ""
        ? ``
        : `&publisher=${advanceSearch?.publisher}`;

    let edition_date =
      advanceSearch?.edition_date === ""
        ? ``
        : `&edition_date=${advanceSearch?.edition_date}`;

    let died_before_AH =
      advanceSearch?.died_before_AH === ""
        ? ``
        : `&died_before_AH=${advanceSearch?.died_before_AH}`;

    let died_after_AH =
      advanceSearch?.died_after_AH === ""
        ? ``
        : `&died_after_AH=${advanceSearch?.died_after_AH}`;

    QUERY_PARAMS = `?&ordering=${orderBy}&page=${
      !page ? 1 : page
    }&page_size=${pagesize}${annotationFilterQuery}${statusQuery}${searchQuery}${normalize}${max_tok_count}${min_tok_count}${editor}${edition_place}${publisher}${edition_date}${died_before_AH}${died_after_AH}`;

    if (releaseCodeQuery) {
      const res = await fetch(
        `${
          DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL
        }${releaseCodeQuery}/version/all/${QUERY_PARAMS}`,
        { mode: "cors" }
      );
      if (res.status) {
        const json = await res.json();
        return json;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
}

// get sidepanel data base on version uri and release code
export async function getSidePanelData(release_code, version_id) {
  try {
    const QUERY_PARAMS = `${release_code ? `${release_code}/` : ""}version/${
      version_id ? `${version_id}/` : ""
    }`;

    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${QUERY_PARAMS}`,
      { mode: "cors" }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    return error;
  }
}

// get author by uri
export async function getAuthorByUri(author_uri) {
  try {
    let QUERY_PARAMS = "?author_uri=" + author_uri;
    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${QUERY_PARAMS}`,
      { mode: "cors" }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    return error;
  }
}

// get version meta data by id
// CHECK CONTAINS FILTER
export async function getVersionMetadataById(release_code, version_id) {
  try {
    const QUERY_PARAMS = `${release_code}/version/${version_id}/`;
    console.log(
      `downloading metadata from: ${
        DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL
      }/${QUERY_PARAMS}`
    );

    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${QUERY_PARAMS}`,
      { mode: "cors" }
    );
    const json = await res.json();
    //console.log(json);
    return json;
  } catch (error) {
    return error;
  }
}

// get all pairwise text reuse data by version id from the API
export async function getAllPairwiseData(
  release_code,
  version_uri,
  sortingOrder,
  query,
  page
) {
  try {
    let RESOURCE = `${release_code}/text-reuse-stats/`;
    let book1 = version_uri ? `book_1=${version_uri}` : "";
    let queryParam = query ? `&search=${query}` : "";
    let sortingParam = sortingOrder ? `&ordering=${sortingOrder}` : "";
    let pageParam = page ? `&page=${page}` : "";

    let QUERY_PARAMS = `?${book1}${queryParam}${sortingParam}${pageParam}`;

    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${RESOURCE}/${QUERY_PARAMS}`,
      { mode: "cors" }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    return error;
  }
}

export async function getAggregatedStats() {
  try {
    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/aggregatedstats/`,
      { mode: "cors" }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return error;
  }
}

// get corpus insight data

export async function getCorpusInsightData(releaseCode) {
  try {
    const RELEASE_CODE = releaseCode;
    const res = await fetch(`${DEV_BASE_URL}/${RELEASE_CODE}/corpusinsights/`, {
      mode: "cors",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return error;
  }
}
