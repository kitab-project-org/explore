import { arTokRegex, arCharRegexWithSpace, anyLetterOrDigitRegexWithSpace, doNotCountRegex, transcription_chars } from "../assets/js/openITI.js";

// extract the alignment from a milestone text
// releaseVersion: release code string (e.g. "2024.1.9"); determines which
// char regex to use for "char" token mode (>= v9: with digits, < v9: without).
export const extractAlignment = (msText, startTok, endTok, token="word", releaseVersion=null) => {
    let tokRegex;
    if (token === "word"){
      tokRegex = arTokRegex;
    } else {
      const nums = (releaseVersion ?? "").match(/\d+/g) ?? [];
      const relNo = nums.length ? parseInt(nums[nums.length - 1], 10) : 0;
      if (relNo >= 9){
        tokRegex = anyLetterOrDigitRegexWithSpace;
        msText = msText.replace(doNotCountRegex, (m) => " ".repeat(m.length));
      } else {
        tokRegex = arCharRegexWithSpace;
        if (relNo === 8) {
          // remove all non-letter characters + digits + Latin letters (incl. those with diacritics)
          let deleteRegex = new RegExp("[\\P{L}\\d"+transcription_chars+"]", "gu");
          msText = msText.replace(deleteRegex, (m) => " ".repeat(m.length));
        } else {
          // remove all non-letter characters + digits + ASCII characters
          let deleteRegex = new RegExp("[\\P{L}\\dA-Za-z]", "gu");
          msText = msText.replace(deleteRegex, (m) => " ".repeat(m.length));
        }
      }  
      tokRegex = relNo >= 9 ? anyLetterOrDigitRegexWithSpace : arCharRegexWithSpace;
    }
    
    // get the start index of each Arabic token in the milestone text:
    //let tokenMatches = msText.matchAll(tokRegex);
    //console.log([...tokenMatches]);
    let tokenStartIndices = [];
    for (const m of msText.matchAll(tokRegex)) {
      //console.log(m);
      tokenStartIndices.push(m.index);
    }
    
    // map the start and end tokens to characters in the text:
    const startChar = tokenStartIndices[startTok] || 0;
    const endChar = tokenStartIndices[endTok] ||  msText.length;
    const alignment = msText.slice(startChar, endChar);
       
    return [alignment, startChar, endChar];
  };
/*
// Split the text of a milestone to emphasize the alignment:
export const splitMilestone = (msText) => {

    // get the start and end token of the alignment:
    let startTok = bookNumber === 1 
      ? booksAlignment.bw1 
      : booksAlignment.bw2;  
    let endTok = bookNumber === 1 
      ? booksAlignment.ew1 
      : booksAlignment.ew2;

    // extract the alignment from the milestone text
    // (and get its start and end character index)
    let resp = extractAlignment(msText, startTok, endTok);
    let [alignment, startChar, endChar] = resp;

     // split the text:
    let beforeAlignment = msText.slice(0,startChar);
    let afterAlignment = msText.slice(endChar, msText.length);
 

    // set the book alignment string: 
    if (bookNumber === 1) {
      booksAlignment["s1"] = alignment;
    } else {
      booksAlignment["s2"] = alignment;
    }
    //setBooksAlignment(booksAlignment);

    return `${beforeAlignment}<br>ˇˇˇˇˇˇˇˇˇˇˇ<br>${alignment}<br>^^^^^^^^^^^^<br>${afterAlignment}`;
  }*/