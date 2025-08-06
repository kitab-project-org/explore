import { Box, IconButton, MenuItem } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../../App";

const MSToggler = ({ isTop, isBook1, selectLineOnClicked, mouseOver }) => {
  const { chartData, focusedDataIndex, setFocusedDataIndex } =
    useContext(Context);
  const selectRef = useRef(null);
  const [totalElements, setTotalElements] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);
  const [toggle, setToggle] = useState(false);

  // select the next/previous milestone:
  const handleFocusData = (actionType) => {
    if (chartData?.dataSets.length !== 0) {
      if (actionType === "plus") {
        // select next milestone in the list:
        if (focusedDataIndex < chartData?.dataSets.length - 2) {
          if (focusedDataIndex === null) {
            const value = 0;
            setFocusedDataIndex(value);
            mouseOver(null, chartData?.dataSets[value]);
            selectLineOnClicked(null, chartData?.dataSets[value]);
          } else {
            const value = focusedDataIndex + 1;
            setFocusedDataIndex(value);
            mouseOver(null, chartData?.dataSets[value]);
            selectLineOnClicked(null, chartData?.dataSets[value]);
          }
        }
      } else {
        // select previous milestone in the list:
        if (focusedDataIndex < 1) {
        } else {
          const value = focusedDataIndex - 1;
          setFocusedDataIndex(value);
          mouseOver(null, chartData?.dataSets[value]);
          selectLineOnClicked(null, chartData?.dataSets[value]);
        }
      }
    }
  };

  // when user selects an item from the dropdown:
  const handleChange = (value) => {
    if (value) {
      setFocusedDataIndex(value);
      mouseOver(null, chartData?.dataSets[value]);
      selectLineOnClicked(null, chartData?.dataSets[value]);
      setToggle(false);
    }
  };

  // Initialize and update sorted items when chartData changes
  useEffect(() => {
    if (chartData) {
      const modified = chartData.dataSets.map((item, key) => ({
        ...item,
        key: key,
      }));
      const sorted = modified.sort((a, b) =>
        isTop ? a.seq1 - b.seq1 : a.seq2 - b.seq2
      );
      setTotalElements(sorted);
      const nextItems = sorted.slice(0, 50);
      setSortedItems(nextItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    const nextItems = totalElements.slice(
      sortedItems.length,
      sortedItems.length + 50
    );
    setSortedItems([...sortedItems, ...nextItems]);
  };

  const handleScroll = (e) => {
    if (selectRef.current) {
      const isBottom =
        selectRef.current.scrollTop + selectRef.current.clientHeight >=
        selectRef.current.scrollHeight - 100;
      if (isBottom) {
        loadMore();
      }
    }
  };

  // open/close the dropdown list
  const handleToggle = () => {
    setToggle(!toggle);
    if (!toggle === false) {
      if (chartData) {
        const modified = chartData.dataSets.map((item, key) => ({
          ...item,
          key: key,
        }));
        const sorted = modified.sort((a, b) =>
          isTop ? a.seq1 - b.seq1 : a.seq2 - b.seq2
        );
        setTotalElements(sorted);
        const nextItems = sorted.slice(0, 50);
        setSortedItems(nextItems);
      }
    }
  };

  return (
    <Box display="flex" alignItems="center" my="20px">
      <IconButton
        sx={{
          width: "30px",
          height: "30px",
          fontSize: "14px",
          borderRadius: "0px",
          border: "1px solid grey",
        }}
        onClick={() => handleFocusData("minus")}
      >
        <i className="fa-solid fa-angle-left"></i>
      </IconButton>
      <Box sx={{ position: "relative" }}>
        <Box
          onClick={handleToggle}
          sx={{
            width: "80px",
            height: "28px",
            borderTop: "1px solid grey",
            borderBottom: "1px solid grey",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          {isTop
            ? chartData?.dataSets[focusedDataIndex]?.seq1
            : chartData?.dataSets[focusedDataIndex]?.seq2}
        </Box>
        {toggle && (
          <>
            <Box
              onClick={() => setToggle(false)}
              sx={{
                position: "fixed",
                width: "100%",
                height: "100vh",
                zIndex: 9999,
                top: 0,
                left: 0,
              }}
            ></Box>
            <Box
              sx={{
                width: "80px",
                height: "200px",
                borderRadius: "3px",
                boxShadow: "0px 0px 2px 0px grey",
                position: "absolute",
                top: "100%",
                left: "0",
                overflow: "hidden",
                overflowY: "scroll",
                bgcolor: "white",
                zIndex: 99999,
              }}
              ref={selectRef}
              onScroll={handleScroll}
            >
              {sortedItems.map((item, i) => (
                <MenuItem
                  key={i}
                  onClick={() => handleChange(item.key)}
                  sx={{ fontSize: "14px" }}
                >
                  {isBook1 ? item.seq1 : item.seq2}
                </MenuItem>
              ))}
            </Box>
          </>
        )}
      </Box>

      <IconButton
        sx={{
          width: "30px",
          height: "30px",
          fontSize: "14px",
          borderRadius: "0px",
          border: "1px solid grey",
        }}
        onClick={() => handleFocusData("plus")}
      >
        <i className="fa-solid fa-angle-right"></i>
      </IconButton>
    </Box>
  );
};

export default MSToggler;
