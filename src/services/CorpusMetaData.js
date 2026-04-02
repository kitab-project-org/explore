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
  advanceSearch,
  includeManuscripts,
  languageQuery
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
        ? `&${searchField}=${query}`
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

    // always send include_manuscripts so the API knows whether to include them
    const manuscriptsFilter = `&include_manuscripts=${includeManuscripts ? 'true' : 'false'}`;
    // only send language when a subset is selected; omitting it returns all languages
    const languageFilter = languageQuery ? `&language=${languageQuery}` : ``;

    QUERY_PARAMS = `?&ordering=${orderBy}&page=${
      !page ? 1 : page
    }&page_size=${pagesize}${annotationFilterQuery}${statusQuery}${searchQuery}${normalize}${max_tok_count}${min_tok_count}${editor}${edition_place}${publisher}${edition_date}${died_before_AH}${died_after_AH}${manuscriptsFilter}${languageFilter}`;

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

// Build the URL for the version-tsv endpoint with the same filters as getCorpusMetaData
// but without pagination (returns all matching rows as a TSV file).
export function getCorpusMetaDataTsvUrl(
  query,
  searchField,
  normalizedSearch,
  annotationFilter,
  orderBy,
  analysisPriority,
  releaseCode,
  advanceSearch,
  includeManuscripts,
  languageQuery
) {
  const filterString = () => {
    let str = "";
    str = annotationFilter?.notYetAnnotated ? str + "(not yet annotated)," : str;
    str = annotationFilter?.inProgress ? str + "inProgress," : str;
    str = annotationFilter?.completed ? str + "completed," : str;
    str = annotationFilter?.mARkdown ? str + "mARkdown," : str;
    if (str.endsWith(",")) str = str.slice(0, -1);
    return str;
  };
  const annotationFilterQuery = annotationFilter ? `&annotation_status=${filterString()}` : "";
  const searchQuery = searchField && query
    ? `&${searchField}=${query}`
    : query ? `&search=${query}` : "";
  const normalize = normalizedSearch ? `` : `&normalize=false`;
  const statusQuery = analysisPriority ? `` : "&analysis_priority=pri";
  const max_tok_count = advanceSearch?.max_tok_count === "" ? `` : `&tok_count_lte=${advanceSearch?.max_tok_count}`;
  const min_tok_count = advanceSearch?.min_tok_count === "" ? `` : `&tok_count_gte=${advanceSearch?.min_tok_count}`;
  const editor = advanceSearch?.editor === "" ? `` : `&editor=${advanceSearch?.editor}`;
  const edition_place = advanceSearch?.edition_place === "" ? `` : `&edition_place=${advanceSearch?.edition_place}`;
  const publisher = advanceSearch?.publisher === "" ? `` : `&publisher=${advanceSearch?.publisher}`;
  const edition_date = advanceSearch?.edition_date === "" ? `` : `&edition_date=${advanceSearch?.edition_date}`;
  const died_before_AH = advanceSearch?.died_before_AH === "" ? `` : `&died_before_AH=${advanceSearch?.died_before_AH}`;
  const died_after_AH = advanceSearch?.died_after_AH === "" ? `` : `&died_after_AH=${advanceSearch?.died_after_AH}`;
  const manuscriptsFilter = `&include_manuscripts=${includeManuscripts ? 'true' : 'false'}`;
  const languageFilter = languageQuery ? `&language=${languageQuery}` : ``;

  const QUERY_PARAMS = `?ordering=${orderBy}${annotationFilterQuery}${statusQuery}${searchQuery}${normalize}${max_tok_count}${min_tok_count}${editor}${edition_place}${publisher}${edition_date}${died_before_AH}${died_after_AH}${manuscriptsFilter}${languageFilter}`;
  const BASE = DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL;
  return `${BASE}/${releaseCode}/version-tsv/${QUERY_PARAMS}`;
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

// get corpus insight data for a single release
export async function getCorpusInsightData(releaseCode) {
  try {
    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/${releaseCode}/corpusinsights/`,
      { mode: "cors" }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return error;
  }
}

// get corpus insight data for all releases (used to populate the version dropdown
// and derive which releases have subcorpora)
export async function getAllReleasesInsights() {
  try {
    const res = await fetch(
      `${DEV_ENV ? DEV_BASE_URL : PROD_BASE_URL}/all-releases/corpusinsights/`,
      { mode: "cors" }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return error;
  }
}
