import { useContext } from "react";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Context } from "../../../../App";


const SelfReuseFilter = () => {
  const { selfReuseOnly, setSelfReuseOnly } = useContext(Context);
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={selfReuseOnly ?? false}
          onChange={() => setSelfReuseOnly(prev => !prev)}
        />
      }
      label={<Typography variant="body2">Self reuse only</Typography>}
      sx={{ px: "60px", display: "flex", mt: "-30px" }}
    />
  );
};

export default SelfReuseFilter;