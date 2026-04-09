import axios from "axios";
import { parseImech } from "../utility/Helper";
import { getVersionMetadataById } from "../services/CorpusMetaData";

/**
 * Get the text of a milestone (300-word chunk of text).
 *
 * This function currently downloads the milestone texts
 * from the i.mech repository (https://github.com/openiti/i.mech)
 * which stores the milestones in groups of 300 milestones.
 * The i.mech file names have this format:
 * <versionCodeWithExtension>-<lastMsNo5Digits>
 * (e.g., "JK00001-ara1.completed-00300")
 * The function stores the downloaded milestones
 * in a context variable (downloadedTexts) to avoid re-downloading.
 *
 * @param {String} releaseCode The ID of the OpenITI release (yyyy.n.n)
 * @param {String} versionCode The ID of the text version in OpenITI
 *                             (without language code and extension)
 * @param {Number} msNo The number of the requested milestone
 * @param {Object} downloadedTexts context variable containing all previously
 *                                 downloaded milestones
 * @param {Object} downloadedTexts.releaseCode OpenITI release code
 * @param {Object} downloadedTexts.releaseCode.versionCode OpenITI text version code
 * @param {String} downloadedTexts.releaseCode.versionCode.msNo milestone number
 *   (val: text of the milestone)
 * @param {Function} setDownloadedTexts Function that updates
 *                                      the downloadedTexts context variable
 * @param {Object} [meta=null] Metadata for the text version
 *                             in the specified OpenITI release
 * @param {Number} [msPerFile=300] Number of milestones per i.mech file.
 *
 * @return {String} Text of the requested milestone
 */
export async function getMilestoneText(
  releaseCode,
  versionCode,
  msNo,
  downloadedTexts,
  setDownloadedTexts,
  meta = null
) {
  console.log("getting milestone " + msNo + " from " + versionCode);

  // check if (part of) this specific text version has already been downloaded:
  try {
    let msDict = downloadedTexts[releaseCode][versionCode]["downloadedMs"];
    //console.log("milestones from this text were already downloaded")
    // check if the milestone number is among the downloaded milestones:
    let msText = msDict[msNo.toString()];
    if (msText) {
      return msText;
    } else {
      //console.log("but not the requested milestone number")
      // continue: download the section containing the milestone (below)
    }
  } catch (e) {
    // not yet in the dictionary: create relevant sub-dictionaries:
    try {
      downloadedTexts[releaseCode][versionCode] = {
        downloadedMs: {},
      };
    } catch (e) {
      downloadedTexts[releaseCode] = {};
      downloadedTexts[releaseCode][versionCode] = {
        downloadedMs: {},
      };
    }
  }

  // download metadata if not provided:
  if (!meta) {
    meta = await getVersionMetadataById(releaseCode, versionCode);
    //console.log(meta);
  }
  // Build the URL of the i.mech file containing the milestone:
  // const imechUrl =
  //   releaseCode === "2021.2.5"
  //     ? `https://raw.githubusercontent.com/OpenITI/i.mech-v5/main/data`
  //     : `https://raw.githubusercontent.com/OpenITI/i.mech/v${releaseCode}/data`;
  let imechUrl, msPerFile;
  if (releaseCode === "2021.2.5"){
    imechUrl = `https://raw.githubusercontent.com/OpenITI/i.mech-v5/main/data`;
    msPerFile = 300
  } else if ( parseInt(releaseCode.slice(0,4)) < 2023){
    imechUrl = `https://raw.githubusercontent.com/OpenITI/i.mech/v${releaseCode}/data`;
    msPerFile = 300
  } else {
    imechUrl = `https://raw.githubusercontent.com/OpenITI/i.mech-20/v${releaseCode}/data`;
    msPerFile = 20
  }
  
  const sectionNo = (msPerFile * Math.ceil(msNo / msPerFile))
    .toString()
    .padStart(5, "0");
  const idWithExt = meta.release_version.url
    .split("/")
    .slice(-1)[0] // take the last part of the URL
    .split(".")
    .slice(2)
    .join("."); // remove the book URI
  const downloadUrl = `${imechUrl}/${idWithExt}-${sectionNo}`;
  // Download the i.mech file:
  console.log("downloading: " + downloadUrl);
  try {
    const response = await axios.get(downloadUrl);
    console.log("Download of i.mech file finished");
    // Parse the content of the i.mech file
    // (object with milestone numbers and milestone text)
    const msTexts = parseImech(response.data);
    // Store the downloaded texts in the Context state
    // (NB: using the arrow function avoids race condition!):
    setDownloadedTexts((prev) => {
      return {
        ...prev,
        [releaseCode]: {
          ...prev?.[releaseCode],
          [versionCode]: {
            ...prev?.[releaseCode]?.[versionCode],
            downloadedMs: {
              ...prev?.[releaseCode]?.[versionCode]?.["downloadedMs"],
              msTexts,
            },
          },
        },
      };
    });
    // Finally, return the requested milestone text:
    return msTexts[msNo.toString()];
  } catch (err) {
    console.log("Download of milestones failed from: " + downloadUrl);
    return "DATA NOT AVAILABLE";
  }
}
