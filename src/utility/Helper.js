import { srtFolders, lightSrtFolders, srtFoldersGitHub} from "../assets/srtFolders"
import { config } from "../config";
const { GITHUB_BASE_URL, GITHUB_BASE_RAW_URL } = config;


/**
 * Testing functionality to make a server fetch fail
 * To use - call enableMockFetch({ failForMatch: srtFolders[releaseCode] }) to fail for a specific release code
 */
let originalFetch = null;

function enableMockFetch({ failForMatch = "" } = {}) {
  if (originalFetch) return; // already mocked
  console.log(`[MockFetch] Mocking fetch to fail for: ${failForMatch}`);
  originalFetch = global.fetch;

  global.fetch = async (url, options) => {
    if (failForMatch && url.includes(failForMatch)) {
      console.warn(`[MockFetch] Forcing failure for: ${url}`);
      throw new Error("Simulated fetch failure");
    }

    // fallback behavior: all URLs fail
    if (!failForMatch) {
      console.warn(`[MockFetch] Forcing global failure: ${url}`);
      throw new Error("Simulated fetch failure");
    }

    return originalFetch(url, options); // fallback to real fetch
  };
}

/**
 * Help to try catch to ensure we return false in all cases of invalid urls
 * @param {String} url The URL to check
 * @returns {Boolean} True if the URL is valid, false otherwise
 */

const urlExists = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Check the response for a pairwise csv - fallback to GitHub if not found
 * @param {String} releaseCode OpenITI release version code
 * @param {String} book1 metadata obj book 1
 * @param {String} book2 metadata obj book 2 (if no book2 is provided, it will just check for the parent folder)
 * @param {Boolean} full If true, check for full text reuse data
 *  
 * @returns {Object} {"pairwiseUrl": String, "pairwiseLiteUrl": String, "githubUrl": boolean}
 * If the response fails for either URL, it will return null for that field. If it returns a githubUrl, then githubUrl will be true
 */

const checkPairwiseCsvResponse = async (releaseCode, book1, book2=null, full=false) => {
  // Set pairwise lite URL as null - in case we do not find it
  let pairwiseLiteUrl = null;
  // If full is true check for full and set full and lite URLs accordingly
  if (full || book2 === null) {
    let pairwiseFullUrl
    if (book2 === null) {
      console.log(book1)
      const b1ID = getVersionIDfromURL(book1.release_version.url, true);
      const baseURL = srtFolders[releaseCode];
      pairwiseFullUrl = `${baseURL}/${b1ID}/`;
    } else {
      pairwiseFullUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, false);
    }
    const urlRes = await urlExists(pairwiseFullUrl);
    if (urlRes) {
      console.log("Full text reuse data found at: " + pairwiseFullUrl);
      if (book2 === null) {
        // If there is no book2, then we check a response on the tree, not the raw
        const b1ID = getVersionIDfromURL(book1.release_version.url, true);
        const baseURL = lightSrtFolders[releaseCode];
        pairwiseLiteUrl = `${baseURL}/${b1ID}/`;
      } else {
        pairwiseLiteUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, true);
      }
      return { pairwiseUrl: pairwiseFullUrl, pairwiseLiteUrl: pairwiseLiteUrl, githubUrl: false};
    }
  } else {
    // Otherwise just check pairwise URL
    const pairwiseLiteUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, true);
    const urlRes = await urlExists(pairwiseLiteUrl);
    if (urlRes) {
      return { pairwiseUrl: null, pairwiseLiteUrl: pairwiseLiteUrl, githubUrl: false};
    }
  }
  // If we have not returned yet, the response failed so we check GitHub (just lite URL)
  let githubUrl;
  if (book2 === null) {
    // If there is no book2, then we just return - as we cannot check the GitHub URL without a book2
    return { pairwiseUrl: null, pairwiseLiteUrl: null, githubUrl: true };
  } else {
    githubUrl = await buildPairwiseCsvURL(releaseCode, book1, book2, false, true);
  }
  // Check the GitHub URL
  const githubRes = await urlExists(githubUrl);
  if (githubRes) {
    return { pairwiseUrl: null, pairwiseLiteUrl: githubUrl, githubUrl: true };
  } else {
    // If both responses fail, return null for both URLs}
    return { pairwiseUrl: null, pairwiseLiteUrl: pairwiseLiteUrl, githubUrl: false };
  }

};


/** Load the pairwise visualisation through a URL - builds the URL and opens it in a new tab
   * @param {String} releaseCode OpenITI release version code
   * @param {String} idPair The pair of book IDs to visualise, e.g. "book1_book2"
*/
const loadChartFromUrl = async (releaseCode, idPair) => {
  
  const baseUrl = window.location.origin;
  const vizUrl = `${baseUrl}/explore/#/visualise/${releaseCode}/?books=${idPair}`;
  window.open(vizUrl, "_blank");
  
}

const pad = (n, width, z) => {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const getVersionIDfromURI = (versionURI, includeExt=true) => {
  /* eslint-disable no-unused-vars */
  const [author, book, ...version] = versionURI.split(".");
  /* eslint-enable no-unused-vars */
  return version.join(".");
}

const getVersionIDfromURL = (versionURL, includeExt=true) => {
  const versionURI = versionURL.split("/").pop();
  return getVersionIDfromURI(versionURI, includeExt);
}

/** 
   * build the URL to the pairwise CSV file on the KITAB webserver:
   * based on the metadata for both books:
   * 
   * @param {String} releaseCode OpenITI release version code
   * @param {Object} b1Data full metadata for book 1
   * @param {Object} b2Data full metadata for book 2
   * @param {Boolean} light Download the light or full text reuse data csv
   * @param {Boolean} githubUrl If true, use the GitHub URL instead of the KITAB webserver URL
   * 
   * @returns String (URL of the pairwise CSV file)
  */
  const buildPairwiseCsvURL = async (releaseCode, b1Data, b2Data, light=false, githubUrl = false) => {
    // get the IDs (incl. extension) for both books:
    const b1ID = getVersionIDfromURL(b1Data.release_version.url, true);
    const b2ID = getVersionIDfromURL(b2Data.release_version.url, true);

    // if githubUrl is true then we use that for the base URL - otherwise base URL is from webserver
    if (githubUrl) {
      const baseURL = srtFoldersGitHub[releaseCode];
      
      // build the URL:
      return `${baseURL}/${b1ID}/${b1ID}_${b2ID}.csv`;
    } else {
      const baseURL = light ? lightSrtFolders[releaseCode] : srtFolders[releaseCode];
      
      // build the URL:
      return `${baseURL}/${b1ID}/${b1ID}_${b2ID}.csv`;
    } 

  }

/**
 * Remove the page parameter from a querystring
 * @param {Object} searchParams querystring object
 * @returns Object
 */
const cleanSearchPagination = (searchParams) => {
  return Object.fromEntries([...searchParams].filter(([key]) => key !== "page"));
}

/**
 * Calculate the x and y coordinates of a tooltip
 * @param {Event} event The Event object that contains information on where the mouse hovers
 * @param {Element} tooltipDiv The tooltip element itself
 * @param {String} tooltipMsg The text content of the tooltip
 * @param {String} containerID The ID of the container in which the graph is found
 * @returns Array (x, y)
 */
function calculateTooltipPos(event, tooltipDiv, tooltipMsg, containerID){
  const containerRect = document.getElementById(containerID).getBoundingClientRect();
  let x = event.pageX - containerRect.left - window.scrollX + 15;
  let y = event.pageY - containerRect.top - window.scrollY + 10;
  // 2. Temporarily set the tooltip text so we can measure it
  const tooltipNode = tooltipDiv.node();
  tooltipDiv.html(tooltipMsg).style("opacity", 0.9);
  // 3. Measure the tooltip
  const tooltipWidth = tooltipNode.offsetWidth;
  const tooltipHeight = tooltipNode.offsetHeight;
  const containerWidth = containerRect.width;
  const viewportHeight = window.innerHeight;
  // 4. Adjust X: flip to left if overflowing to the right
  if (x + tooltipWidth > containerWidth) {
    x = Math.max(0, x - tooltipWidth - 30); // flip to left side if possible
  }
  // Adjust Y: flip to above if overflowing to the bottom
  const pageY = event.pageY; // relative to full document
  const tooltipBottom = pageY + tooltipHeight + 10;
  if (tooltipBottom > viewportHeight + window.scrollY) {
    y = event.pageY - containerRect.top - window.scrollY - tooltipHeight - 10;
  }
  return [x, y];
}

/** Get the highest value for a key in an array of objects
 * 
 * @param {Array} arr 
 * @param {String} key 
 * @returns Integer
 */
function getHighestValueInArrayOfObjects(arr, key){
  let highest = -Infinity;
  for (let i=0; i<arr.length; i++){
    let n = parseInt(arr[i][key]);
    if (n > highest) {
      highest = n;
    }
  }
  return highest;
}

/*
function to  takes author death date as the parameter to return a padded repo URL
*/
const getGHRepo = (date) =>
  GITHUB_BASE_URL + "/" + pad(Math.ceil(date / 25) * 25, 4) + "AH/tree/master/data/";

const getGitHubRepoURL = (uri, type) => {
  if (uri) {
    const title = uri.split(".")[1];
    const author = uri.split(".")[0];
    const author_title = author + "." + title;
    const date = uri.substring(0, 4);

    if (type === "v") {
      return (
        GITHUB_BASE_URL +
        pad(Math.ceil(date / 25) * 25, 4) +
        "AH/tree/master/data/" +
        uri.split(".")[0] +
        "/" +
        author_title
      );
    }
    if (type === "a") {
      return (
        GITHUB_BASE_URL +
        pad(Math.ceil(date / 25) * 25, 4) +
        "AH/tree/master/data/" +
        author
      );
    }
  }
};

export const getGitHubRepoURLRaw = (uri, type) => {
  if (uri) {
    const title = uri.split(".")[1];
    const author = uri.split(".")[0];
    const author_title = author + "." + title;
    const date = uri.substring(0, 4);

    if (type === "v") {
      return (
        GITHUB_BASE_RAW_URL +
        pad(Math.ceil(date / 25) * 25, 4) +
        "AH/master/data/" +
        uri.split(".")[0] +
        "/" +
        author_title
      );
    }
    if (type === "a") {
      return (
        GITHUB_BASE_RAW_URL +
        pad(Math.ceil(date / 25) * 25, 4) +
        "AH/master/data/" +
        author
      );
    }
  }
};

/**
 * function to  take a object (obj) and object for newKeys and rename the keys before return the object e.g. change 'text_uri' to 'Text URI'
 */
const renameKeys = (obj, newKeys) => {
  const keyValues = Object.keys(obj).map((key) => {
    const newKey = newKeys[key] || key;
    return { [newKey]: obj[key] };
  });
  return Object.assign({}, ...keyValues);
};
const deleteKey = (key, { [key]: deletedKey, ...others }) => others;

const convertNumberToMillions = (labelValue) => {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
};

// page number formatting of books in books section of visualization page
// THIS FUNCTION REPLACES ALL PAGE NUMBERS IN AN I.MECH FILE WITH THE PAGE NUMBER OF THE FIRST PAGE IN IT!
/*function pageNumberFormat(text) {
  var re = /(Page)(V\d{2})(P\d+\s)/g;
  var match = re.exec(text);
  //Vol. 5, p.22
  if (match) {
    var volnumber = parseInt(match[2].replace("V", ""), 10);
    var pagenumber = parseInt(match[3].replace("P", ""), 10);
  }
  text = text.replace(
    re,
    "<br/><a style='font-size: 14px; color: #059669;' title='archive.org' href='https://archive.org/' target='_blank'>" +
      "Vol." +
      volnumber +
      ", p." +
      pagenumber +
      "</a> <br/>"
  );

  return text;
}*/

function pageNumberFormat(text) {
  let pageTag ='<div class="pageNo">';
  //"<a style='font-size: 14px; color: #059669;' href='https://archive.org/' target='_blank'>";
  let re = /PageV0*([^P]+)P0*(\d+[AB]?)/g;
  //text = text.replace(re, `<br/>${pageTag}Vol. $1, p. $2</a> <br/>`);
  text = text.replace(re, `${pageTag}Vol. $1, p. $2</div>`);
  return text;
}

// Quran's ayat formatting in books section of visualization page

function quranVerseFormat(text) {
  var re = /@QB@(.*)@QE@/g;
  var match = re.exec(text);
  if (match) {
    text = text.replace(re, "<span class='quran-verse'>$1</span>");
  }
  return text;
}

// milestone formatting in book section of visualization
function imechToHtml(text) {
  console.log("imechToHtml");
  // new lines and paragraphs:
  text = text.replace(/\(@\)/g, "<br>"); // "\n" encoded as "(@)" in i.mech
  text = text.replace(/\(@@\)/g, "#"); // "#" encoded as "(@@)" in i.mech
  text = text.replace(/(?:\n|<br>)# /g, "<br>");
  text = text.replace(/(?:\n|<br>)~~/g, " ");
  // paratext / editorial tags:
  text = text.replace(/### \|([A-Z]+)\|/g, "<br/>($1)<br/>"); 
  // section titles:
  text = text.replace(
    /### (?<pipes>\|+)(?<titleText>[^<]+)(?:<br>)*/g,
    function (match, pipes, titleText) {
      let nPipes = pipes.length;
      return `<h${nPipes}>${titleText}</h${nPipes}>`;
    }
  );
  // dictionary entry titles: 
  text = text.replace(/### \$+ ([^<]*)(?:<br\/?>)*/g, "<h3>$1</h3>")

  text = pageNumberFormat(text);
  text = quranVerseFormat(text);
  text = text.replace(/ +/g, " ");
  text = text.replace(/(?:<br\/?>)+/g, "<br/>");
  return text;
}

// milestone formatting in book section of visualization
function cleanImech(text) {
  text = text.replace(/\(@@\)/g, "<br/>");
  text = text.replace(/[ ()|@#$~-]+/g, " "); 
  text = text.replace(/ +/g, " ");
  return text;
}

function cleanBeforeDiff(text, normalizeAlif, normalizeYa, normalizeHa, removePunct, removeTags) {
  text = cleanImech(text);
  if (normalizeAlif) {
    text = text.replace(/[أإآٱ]/g, "ا");
  }
  if (normalizeYa){
    // normalize Persian ya and alif maqsura to Arabic ya:
    text = text.replace(/[یى]/g, "ي");
  }
  if (normalizeHa){
    // normalize ta marbuta to ha:
    text = text.replace(/ة/g, "ه");
  }
  if (removePunct) {
    // replace poetry marker "..." with OpenITI poetry marker:
    text = text.replace(/ \.\.\. /g, " %~% ")
    // remove footnote markers:
    text = text.replace(/[«([/]\d+[»)\]/]/g, "");
    // remove punctuation:
    text = text.replace(/[.?!:،,’*"'%«»-]+/g, " ")
  }
  if (removeTags) {
    // poetry markers:
    text = text.replace(/ *%~% */g, " ... ");
    // structural tags:
    text = text.replace(/### \|[A-Z]*\|* ?/g, "");
    text = text.replace(/[$~#]+/g, "");
    // semantic tags:
    text = text.replace(/@[a-zA-Z@\d]+/g, "");
    // page numbers:
    text = text.replace(/[\n ]*PageV[^P]+P\d+[a-bA-B]?[\n ]*/g, " ");
    text = text.replace(/ *\[ *ص? *\d+[ أابوظ]*\] */g, " ");
  }
  // remove double spaces:
  text = text.replace(/ +/g, " ");

  return text;
}



// parse i.mech string (each line consists of <milestone_no><tab><milestone_text>)
const parseImech = (s) => {
  //let cleanedStr = imechToHtml(s);

  // create an object (keys: milestone number, values: milestone text)
  var val = {};
  s.split("\n").forEach(function (row) {
    if (row) {
      row = row.split("\t");
      var chunkNumber = Number(row[0].replace(/ms[A-Z]*/, ""));
      val[chunkNumber] = row[1];
    }
  });
  return val;
};

// get the index where you should insert a number in a sorted array:
// https://stackoverflow.com/a/21822316
function bisectLeft(array, value) {
	var low = 0,
		high = array.length;

	while (low < high) {
		var mid = low + high >>> 1;  // binary right shift, i.e., dividing by 2
		if (array[mid] < value) low = mid + 1;
		else high = mid;
	}
	return low;
}

/**
 * Get the width and height of a text
 * if rendered at a specific font size and font in an svg
 * 
 * @param {String} text the text to be wrapped
 * @param {Number} fontSize 
 * @param {String} fontFamily 
 * @returns {Object} boundingbox (x,y,width,height)
 */
function measureSvgText(text, fontSize, fontFamily=null) {
  // Create a temporary, hidden SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";

  // Create a text element
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.setAttribute("x", "0");
  textElement.setAttribute("y", "0");
  textElement.style.fontSize = `${fontSize}px`;
  if (fontFamily){
    textElement.style.fontFamily = fontFamily;
  }
  textElement.textContent = text;

  // Append and measure
  svg.appendChild(textElement);
  document.body.appendChild(svg);
  const bbox = textElement.getBBox();

  // Clean up
  document.body.removeChild(svg);

  return bbox;
}

/**
 * Divide a text string into lines that are max. `maxWidth` wide
 * (based on svg measurement - text in svg does not wrap automatically)
 * 
 * @param {String} text the text to be wrapped
 * @param {Number} maxWidth width of the container that will contain the text
 * @param {Number} fontSize 
 * @param {String} fontFamily 
 * @returns 
 */
function wrapTextToSvgWidth(text, maxWidth, fontSize, fontFamily=null) {
  // split the text into words on space and hyphen (keeping both)
  const words = text.split(/( |-)/);

  // divide the text into lines:
  const lines = [];
  let currentLine = "";
  for (let i=0; i<words.length; i++) {
    const word = words[i];
    // measure the line after adding the new word:
    const lineWidth = measureSvgText(currentLine+word.trim(), fontSize, fontFamily).width;

    if (lineWidth > maxWidth){
      // if the line is now too long, finalize the line without the new word...
      lines.push(currentLine.trim());
      // ...and start a new line
      currentLine = word;
    } else {
      currentLine += word
    }
  }
  // Push the last line:
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }
  return lines;
}


/*
 * get the metadata label to be displayed
 * in the pairwise visualisation
 */
function getMetaLabel(d, metaType) {
  switch (metaType) {
    case "author":
      return d?.bookAuthor;
    case "title":
      return d?.bookTitle?.label;
    case "author+title":
      return `${d?.bookAuthor}, ${d?.bookTitle?.label}`;
    case "versionCode":
      return d?.versionCode;
    default:
      console.log("unexpected value: "+metaType);
  }
}


export {
  getHighestValueInArrayOfObjects,
  calculateTooltipPos,
  cleanSearchPagination,
  pad,
  renameKeys,
  deleteKey,
  getGHRepo,
  getGitHubRepoURL,
  convertNumberToMillions,
  pageNumberFormat,
  quranVerseFormat,
  imechToHtml,
  cleanImech,
  parseImech,
  cleanBeforeDiff,
  bisectLeft, 
  getVersionIDfromURI,
  getVersionIDfromURL,
  buildPairwiseCsvURL,
  measureSvgText,
  wrapTextToSvgWidth,
  loadChartFromUrl,
  getMetaLabel,
  checkPairwiseCsvResponse,
  enableMockFetch
};
