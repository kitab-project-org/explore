import { Box, IconButton, MenuItem, Tooltip } from "@mui/material";
import { useRef, useState } from "react";

const MSToggler = ({
  isTop, isBook1,
  navDataRef, clickToSelectRef, selectLineOnClickedRef, clearSelectedLineRef,
  selectedDRef, panToAlignmentRef,
}) => {
  const selectRef = useRef(null);
  const [toggle, setToggle] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState(false);

  const getList = () => {
    const cur = selectedDRef?.current;
    if (cur) {
      // Filter to alignments that share the selected milestone in the OTHER book:
      if (isTop) {
        // Top toggler (book1): show book1 milestones aligned with selected book2 milestone
        return navDataRef?.current?.bySeq2?.[String(cur.seq2)] ?? [];
      } else {
        // Bottom toggler (book2): show book2 milestones aligned with selected book1 milestone
        return navDataRef?.current?.bySeq1?.[String(cur.seq1)] ?? [];
      }
    }
    return isTop ? navDataRef?.current?.sorted : navDataRef?.current?.sortedBySeq2;
  };

  const isFiltered = !!selectedDRef?.current;

  // Navigate to a specific alignment via the stable refs:
  const navigate = (d1) => {
    if (!d1) return;
    const bookNum = isTop ? 1 : 2;
    clickToSelectRef?.current?.(null, d1, bookNum);
    panToAlignmentRef?.current?.(d1);
    selectLineOnClickedRef?.current?.(null, d1);
    setToggle(false);
  };

  // +/- use the full sorted list, same as the arrow keys:
  const getFullList = () =>
    isTop ? navDataRef?.current?.sorted : navDataRef?.current?.sortedBySeq2;

  const handleNext = () => {
    const list = getFullList();
    if (!list?.length) return;
    setInputError(false);
    setInputVal("");
    const cur = selectedDRef?.current;
    if (!cur && inputError) {
      // No selection due to invalid input: find first alignment >= typed value
      const num = parseInt(inputVal, 10) || 0;
      const seqKey = isTop ? 'seq1' : 'seq2';
      const next = list.find(d => Number(d[seqKey]) >= num) ?? list[0];
      navigate(next);
    } else {
      const idx = cur ? list.indexOf(cur) : -1;
      navigate(list[(idx + 1) % list.length]);
    }
  };

  const handlePrev = () => {
    const list = getFullList();
    if (!list?.length) return;
    setInputError(false);
    setInputVal("");
    const cur = selectedDRef?.current;
    if (!cur && inputError) {
      // No selection due to invalid input: find last alignment <= typed value
      const num = parseInt(inputVal, 10) ?? Infinity;
      const seqKey = isTop ? 'seq1' : 'seq2';
      let prev = null;
      for (let i = list.length - 1; i >= 0; i--) {
        if (Number(list[i][seqKey]) <= num) { prev = list[i]; break; }
      }
      navigate(prev ?? list[list.length - 1]);
    } else {
      const idx = cur ? list.indexOf(cur) : 0;
      navigate(list[(idx - 1 + list.length) % list.length]);
    }
  };

  const handleScroll = (e) => {
    if (selectRef.current) {
      const isBottom =
        selectRef.current.scrollTop + selectRef.current.clientHeight >=
        selectRef.current.scrollHeight - 100;
      if (isBottom) setDisplayCount(c => c + 50);
    }
  };

  const cur = selectedDRef?.current;
  const displayVal = cur ? (isTop ? cur.seq1 : cur.seq2) : null;

  // Navigate to the milestone typed in the input box:
  const commitInput = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || val === "") { setInputVal(""); setInputError(false); return; }
    const fullList = isTop ? navDataRef?.current?.sorted : navDataRef?.current?.sortedBySeq2;
    const match = fullList?.find(d => Number(isTop ? d.seq1 : d.seq2) === num);
    if (match) {
      setInputError(false);
      setInputVal("");
      navigate(match);
    } else {
      // No alignment found: show the box in red and deselect so the other box shows "None"
      setInputError(true);
      clearSelectedLineRef?.current?.();
    }
  };

  const list = getList();
  const dropdownItems = list?.slice(0, displayCount) ?? [];

  return (
    <Box className="ms-toggler" display="flex" alignItems="center" my="20px">
      <IconButton
        sx={{ width: "30px", height: "30px", fontSize: "14px", borderRadius: "0px", border: "1px solid grey" }}
        onClick={handlePrev}
      >
        <i className="fa-solid fa-angle-left"></i>
      </IconButton>
      <Box sx={{ position: "relative" }}>
          <Box
            component="input"
            type="number"
            value={inputError ? inputVal : (inputVal !== "" ? inputVal : (displayVal ?? ""))}
            placeholder="---"
            onChange={(e) => { setInputVal(e.target.value); setInputError(false); }}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { commitInput(e.target.value); e.target.blur(); }
              else if (e.key === "Escape") { setInputVal(""); setInputError(false); e.target.blur(); }
              else e.stopPropagation();
            }}
            onClick={() => { setInputVal(""); setInputError(false); setToggle(!toggle); setDisplayCount(50); }}
            sx={{
              width: "80px", height: "28px",
              border: "none",
              borderTop: inputError ? "1px solid #d32f2f" : "1px solid grey",
              borderBottom: inputError ? "1px solid #d32f2f" : "1px solid grey",
              cursor: "text", textAlign: "center", fontSize: "14px",
              bgcolor: inputError ? "#ffebee" : isFiltered ? "#e8f0fe" : "transparent",
              color: inputError ? "#d32f2f" : "inherit",
              outline: "none",
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { display: "none" },
              "&[type=number]": { MozAppearance: "textfield" },
            }}
          />
        {toggle && (
          <>
            <Box onClick={() => setToggle(false)}
              sx={{ position: "fixed", width: "100%", height: "100vh", zIndex: 9999, top: 0, left: 0 }}
            />
            <Tooltip
              placement="right"
              title={isFiltered
                ? "Showing only milestones aligned with the selected milestone in the other book. Press Escape to deselect and see all milestones."
                : ""}
            >
              <Box
                sx={{
                  width: "80px", height: "200px", borderRadius: "3px",
                  boxShadow: "0px 0px 2px 0px grey", position: "absolute",
                  top: "100%", left: "0", overflowY: "scroll",
                  bgcolor: "white", zIndex: 99999,
                }}
                ref={selectRef}
                onScroll={handleScroll}
              >
                {dropdownItems.map((item, i) => (
                  <MenuItem key={i} onClick={() => navigate(item)} sx={{ fontSize: "14px" }}>
                    {isBook1 ? item.seq1 : item.seq2}
                  </MenuItem>
                ))}
              </Box>
            </Tooltip>
          </>
        )}
      </Box>
      <IconButton
        sx={{ width: "30px", height: "30px", fontSize: "14px", borderRadius: "0px", border: "1px solid grey" }}
        onClick={handleNext}
      >
        <i className="fa-solid fa-angle-right"></i>
      </IconButton>
    </Box>
  );
};

export default MSToggler;
