import { config } from "../config";
const { KITAB_DEV_URL, ONE_TO_ALL_URL, GITHUB_PAIRWISE_URL } = config;

// folders containing the full srt files (including alignment strings):
export const srtFolders = {
    "2021.2.5": `${KITAB_DEV_URL}/2021.2.5-pairwise`,
    "2022.1.6": `${KITAB_DEV_URL}/2022.1.6-pairwise`,
    "2022.2.7": `${KITAB_DEV_URL}/2022.2.7-pairwise`,
    "2023.1.8": `${KITAB_DEV_URL}/2023.1.8-pairwise`,
    "2025.1.9": `${KITAB_DEV_URL}/2025.1.9-pairwise`,
};

export const srtFoldersGitHub = {
    "2021.2.5": `${GITHUB_PAIRWISE_URL}/v2021.2.5-pri/data`,
    "2022.1.6": `${GITHUB_PAIRWISE_URL}/v2022.1.6-pri/data`,
    "2022.2.7": `${GITHUB_PAIRWISE_URL}/v2022.2.7-pri/data`,
    "2023.1.8": `${GITHUB_PAIRWISE_URL}/v2023.1.8-pri/data`,
    "2025.1.9": `${GITHUB_PAIRWISE_URL}/v2025.1.9-pri/data`,
};

// folders containing the "light" srt files (without alignment strings):
export const lightSrtFolders = {
    "2021.2.5": `${KITAB_DEV_URL}/2021.2.5-pairwise`,  // light folder doesn't exist
    "2022.1.6": `${KITAB_DEV_URL}/2022.1.6-pairwise`,  // light folder doesn't exist
    "2022.2.7": `${KITAB_DEV_URL}/2022.2.7-pairwise-light`,
    "2023.1.8": `${KITAB_DEV_URL}/2023.1.8-pairwise-light`,
    "2025.1.9": `${KITAB_DEV_URL}/2025.1.9-pairwise-light`,
};

export const oneToAllFolders = {
    "2021.2.5": `${ONE_TO_ALL_URL}/v2021.2.5`,
    "2022.1.6": `${ONE_TO_ALL_URL}/v2022.1.6`,
    "2022.2.7": `${ONE_TO_ALL_URL}/v2022.2.7`,
    "2023.1.8": `${ONE_TO_ALL_URL}/v2023.1.8`,
    "2025.1.9": `${ONE_TO_ALL_URL}/v2025.1.9`
}


/* OLD FOLDERS (keeping this here for reference):
// folders containing the full srt files (including alignment strings):
export const srtFolders = {
    "2021.2.5": `${KITAB_DEV_URL}/passim01102021`,
    "2022.1.6": `${KITAB_DEV_URL}/passim01102022`,
    "2022.2.7": `${KITAB_DEV_URL}/passim01122022-v7`,
    "2023.1.8": `${KITAB_DEV_URL}/2023.1.8`,
};

// folders containing the "light" srt files (without alignment strings):
export const lightSrtFolders = {
    "2021.2.5": `${KITAB_DEV_URL}/passim01102021`,  // light folder doesn't exist
    "2022.1.6": `${KITAB_DEV_URL}/passim01102022`,  // light folder doesn't exist
    "2022.2.7": `${KITAB_DEV_URL}/passim01122022-v7-light`,
    "2023.1.8": `${KITAB_DEV_URL}/2023.1.8-light`,
};
*/