import { useEffect } from "react";
import { Box, Tooltip } from "@mui/material";
import { Legend } from "../../Common/colorLegend";


export default function ScatterLegend({colorScale, width, margin}) {
  console.log(Legend(colorScale, {width: width, margin: margin}));
  useEffect( () => {
    const svg = Legend(colorScale, {width: width, margin: margin});
    let div = document.getElementById("scatter-legend")
    div.innerHtml = "";
    div.replaceChildren(svg);
  });

  return (
    <Tooltip 
      title="Total number of characters in text reuse alignments with the milestone in the main book" 
      placement="top">
      <Box 
        id="scatter-legend" 
        sx={{marginRight: 5}}
      />
    </Tooltip>
  )
}