import { Box, Typography } from "@mui/material";
import { useContext} from "react";
import { Context } from "../../../App";

const diffColor = [
  {
    title: "Added",
    color: "lightgreen",
  },
  {
    title: "Removed",
    color: "lightblue",
  },
  {
    title: "Moved",
    color: "PaleGoldenrod",
  },
];

const commonColor = [
  {
    title: "Common",
    color: "lightblue",
  },
  {
    title: "Moved",
    color: "PaleGoldenrod",
  }
];



const ColorKeys = () => {
  const {highlightMode} = useContext(Context);
  console.log(highlightMode);
  const color = highlightMode === "diff" ? diffColor : commonColor;
  return (
    <Box mr="20px" display="flex">
      {color.map((item, i) => (
        <Box
          display="flex"
          justifyContent="center"
          textAlign="center"
          flexDirection="column"
          alignItems="center"
          mx="8px"
          key={i}
        >
          <Typography variant="body2">{item.title}</Typography>
          <Box
            bgcolor={item.color}
            width="20px"
            height="8px"
            borderRadius="50px"
            mt="2px"
          ></Box>
        </Box>
      ))}
    </Box>
  );
};

export default ColorKeys;
