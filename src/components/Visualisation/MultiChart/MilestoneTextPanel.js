import { useRef, useState, useCallback, useMemo } from "react";
import { Box, Button, CircularProgress, IconButton, Typography } from "@mui/material";
import { imechToHtml } from "../../../utility/Helper";

// ─── passim text_cleaner reproduced in JS ────────────────────────────────────

// Extended-Latin transcription characters used in release 8
// (from openiti/helper/rgx.py: transcription_chars)
const TRANSCRIPTION_RE = /[0-9a-zA-ZāĀăĂēĒĕĔṭṬṯṮūŪīĪĭĬİıōŌṣṢšŠḍḌḏḎǧǦġĠğĞḫḪḥḤḳḲẓẒžŽčČçÇñÑãÃáÁàÀäÄéÉèÈêÊëËïÏîÎôÔóÓòÒōÕöÖüÜûÛúÚùÙʿʾ' ]/u;

// release 9+ token splitter and do-not-count patterns
// tok_splitter = r"((?:\|[A-Z]+\|)|[\s~#|]+)"
const TOK_SPLITTER = /(?:\|[A-Z]+\|)|[\s~#|]+/;
// do_not_count patterns joined (simplified JS equivalents)
const DO_NOT_COUNT = /[|$][A-Z]+[|$]|@|\bY[A-Z]?\d+\b|(?:Folio|Page)(?:Beg|Beginning|End)?V|\bms[A-Z]?\d+|!\[[^\]]*\]\([^)]*\)|^\W*\d+\W+$/;

/**
 * Simulate passim's text_cleaner for the given release code.
 * Returns a map: cleanedPos → position in the original `text`.
 *
 * All three release paths collapse multiple non-kept-character runs to
 * a single space; spaces are counted in b1/e1.
 * Pre-applied transformations (diacritics, NFKC, char replacements) are
 * already done on both sides and are ignored here.
 */
function buildCleanedMap(text, releaseCode) {
  // Extract the numeric suffix of the release code (e.g. "2021.1.7" → 7)
  const nums = (releaseCode ?? "").match(/\d+/g) ?? [];
  const relNo = nums.length ? parseInt(nums[nums.length - 1], 10) : 1000;

  if (relNo === 7 || relNo === 8) {
    // Release 7: keep Unicode letter/digit/underscore chars that are NOT
    //   a Unicode digit and NOT a basic Latin letter ([A-z] in Python).
    // Release 8: additionally remove transcription_chars (extended Latin).
    // JS \w only covers ASCII — use \p{L} and \p{N} for Unicode coverage.
    return buildMapFromPredicate(text, (ch) => {
      const isUniWord  = /[\p{L}\p{N}_]/u.test(ch); // Python \w equiv.
      const isUniDigit = /\p{N}/u.test(ch);          // Python \d equiv.
      const isLatin7   = /[A-Za-z]/u.test(ch);       // Python [A-z] equiv.
      const isLatin8   = TRANSCRIPTION_RE.test(ch);
      if (!isUniWord)  return false;             // \W → remove
      if (isUniDigit)  return false;             // \d → remove
      if (relNo === 7 && isLatin7) return false; // [A-z] → remove
      if (relNo === 8 && isLatin8) return false;
      return true;
    });
  }

  // Release 9+: remove_tags logic
  // Split on tok_splitter, keep tokens that have \w and don't match do_not_count,
  // strip \W+ from each token, join with spaces.
  return buildMapFromTokens(text);
}

/** Build map + cleaned text from a per-character keep-predicate (releases 7 & 8). */
function buildMapFromPredicate(text, keep) {
  const map = [], chars = [];
  let pendingSpace = false, pendingPos = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (keep(ch)) {
      if (pendingSpace) { map.push(pendingPos); chars.push(' '); pendingSpace = false; }
      map.push(i); chars.push(ch);
    } else {
      if (!pendingSpace) { pendingSpace = true; pendingPos = i; }
    }
  }
  if (pendingSpace && map.length) { map.push(pendingPos); chars.push(' '); }
  return { map, cleanedText: chars.join('') };
}

/** Build map + cleaned text using the remove_tags token logic (release 9+). */
function buildMapFromTokens(text) {
  const map = [], chars = [];
  const splitRe = /((?:\|[A-Z]+\|)|[\s~#|]+)/g;
  const parts = [];
  let last = 0, match;
  while ((match = splitRe.exec(text)) !== null) {
    if (match.index > last) parts.push({ start: last, str: text.slice(last, match.index), isSep: false });
    parts.push({ start: match.index, str: match[0], isSep: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ start: last, str: text.slice(last), isSep: false });

  let needSpace = false;
  for (const part of parts) {
    if (part.isSep) {
      if (!needSpace && map.length) needSpace = true;
      continue;
    }
    const tok = part.str;
    if (!/[\p{L}\p{N}]/u.test(tok) || DO_NOT_COUNT.test(tok)) {
      if (!needSpace && map.length) needSpace = true;
      continue;
    }
    const rawOff = part.start;
    const cleanedTok = [];
    for (let i = 0; i < tok.length; i++) {
      if (/[\p{L}\p{N}_]/u.test(tok[i])) cleanedTok.push({ rawIdx: rawOff + i, ch: tok[i] });
    }
    if (!cleanedTok.length) { if (!needSpace && map.length) needSpace = true; continue; }
    if (needSpace) { map.push(part.start); chars.push(' '); needSpace = false; }
    for (const { rawIdx, ch } of cleanedTok) { map.push(rawIdx); chars.push(ch); }
    needSpace = true;
  }
  return { map, cleanedText: chars.join('') };
}

const MilestoneTextPanel = ({ text, loading, ms_id, versionCode, releaseCode, alignments, onClose, onFilter }) => {
  const textRef  = useRef(null);
  const [selRange, setSelRange] = useState(null); // { cleanedStart, cleanedEnd }

  // Build the cleaned text and rawMap once per text+release.
  // cleanedText IS what is displayed — so selection offsets on it are directly
  // the cleaned positions (b1/e1 coordinate space).  No tcMap mapping needed.
  const { rawMap, cleanedText } = useMemo(() => {
    if (!text) return { rawMap: [], cleanedText: "" };
    const { map, cleanedText } = buildCleanedMap(text, releaseCode);
    return { rawMap: map, cleanedText };
  }, [text, releaseCode]);

  // Display the nicely formatted text (imechToHtml); cleaned text is used only
  // for position mapping during selection.
  const displayHtml = useMemo(() => text ? imechToHtml(text) : "", [text]);

  // Capture the user's text selection and convert to cleaned-text positions.
  const captureSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setSelRange(null); return; }
    const range = sel.getRangeAt(0);
    if (!textRef.current?.contains(range.commonAncestorContainer)) { setSelRange(null); return; }

    // Measure chars before selection start in the rendered text content.
    const pre = document.createRange();
    pre.selectNodeContents(textRef.current);
    pre.setEnd(range.startContainer, range.startOffset);
    const tcStart = pre.toString().length;
    const tcEnd   = tcStart + range.toString().length;
    if (tcEnd <= tcStart) { setSelRange(null); return; }

    // Strategy: find the selected string in cleanedText to get cleaned positions.
    // If the string appears multiple times, pick the occurrence whose position
    // ratio in cleanedText best matches the selection's ratio in the displayedtext.
    const selectedStr = range.toString();
    const tc = textRef.current.textContent ?? "";
    const posRatio = tc.length > 0 ? (tcStart + tcEnd) / 2 / tc.length : 0;
    const approxClean = Math.round(posRatio * cleanedText.length);

    const occurrences = [];
    let idx = 0;
    while ((idx = cleanedText.indexOf(selectedStr, idx)) !== -1) {
      occurrences.push(idx);
      idx += 1;
    }

    if (!occurrences.length) { setSelRange(null); return; }

    // Pick the occurrence closest to the estimated position.
    const best = occurrences.reduce((a, b) =>
      Math.abs(a - approxClean) <= Math.abs(b - approxClean) ? a : b
    );
    const cleanedStart = best;
    const cleanedEnd   = best + selectedStr.length;

    console.log("[MilestoneTextPanel] selection →",
      `${occurrences.length} occurrence(s) of "${selectedStr.slice(0, 40)}${selectedStr.length > 40 ? '…' : ''}"`,
      `| chosen cleaned [${cleanedStart}, ${cleanedEnd}]`,
      `| rawText [${rawMap[cleanedStart]}, ${rawMap[cleanedEnd]}]`
    );

    if (cleanedEnd > cleanedStart) {
      setSelRange({ cleanedStart, cleanedEnd });
    } else {
      setSelRange(null);
    }
  }, [rawMap, cleanedText]);

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, bgcolor: "background.paper", mt: 1, mb: 1 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                 px: 2, py: 0.75, borderBottom: "1px solid #eee", bgcolor: "#f5f5f5", flexShrink: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Milestone {ms_id} — {versionCode}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {selRange ? (
            <Button size="small" variant="outlined" onClick={() => onFilter(selRange)}
                    sx={{ fontSize: "0.75rem", py: 0.25 }}>
              Filter to selection
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: "#888", fontStyle: "italic" }}>
              Select text to filter
            </Typography>
          )}
          <IconButton size="small" onClick={onClose}>
            <i className="fa-solid fa-xmark" style={{ fontSize: "13px" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Text body */}
      <Box sx={{ px: 2, py: 1.5, maxHeight: "220px", overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : text ? (
          <Box
            ref={textRef}
            onMouseUp={captureSelection}
            onKeyUp={captureSelection}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
            sx={{
              direction: "rtl",
              fontFamily: "'Amiri', 'Noto Naskh Arabic', serif",
              fontSize: "1.05rem",
              lineHeight: 2,
              userSelect: "text",
              cursor: "text",
            }}
          />
        ) : (
          <Typography variant="body2" sx={{ color: "#888", fontStyle: "italic" }}>
            Text not available for this milestone.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MilestoneTextPanel;
