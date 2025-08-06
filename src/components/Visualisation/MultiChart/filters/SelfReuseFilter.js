import {useContext} from "react";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { Context } from "../../../../App";


const SelfReuseFilter = () => {
  const {selfReuseOnly, setSelfReuseOnly} = useContext(Context);
  console.log("selfReuseOnly: "+selfReuseOnly);
  const handleChange = () => {
    console.log(selfReuseOnly);
    setSelfReuseOnly((prev) => !prev)
  }

  return (
    <Box 
      sx={{ 
        width: 200,
        margin: "20px"
        }}
    >
      <FormControlLabel 
        control={
          <Checkbox 
            checked={selfReuseOnly}
            onClick={handleChange}
          />
        }
        label="Self reuse only"
      />
    </Box>

  )
};

export default SelfReuseFilter;