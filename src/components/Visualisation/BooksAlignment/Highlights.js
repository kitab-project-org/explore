import { useContext} from "react";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Context } from "../../../App";

const CustomFormControlLabel = ({ value, label }) => {
  return (
    <FormControlLabel
      value={value}
      control={
        <Radio
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        />
      }
      label={label}
      sx={{
        "& .MuiTypography-root": {
          fontSize: 14,
          userSelect: "none",
        },
      }}
    />
  );
};

const Highlights = () => {
  const {highlightMode, setHighlightMode} = useContext(Context);

  const handleColour = (e) => {
    if (e.target.value === "common") {
      setHighlightMode("common");
      document.documentElement.style.setProperty("--added-color", "white");
      document.documentElement.style.setProperty("--removed-color", "white");
      document.documentElement.style.setProperty("--common-color", "lightblue");
    } else {
      setHighlightMode("diff");
      document.documentElement.style.setProperty("--added-color", "lightgreen");
      document.documentElement.style.setProperty(
        "--removed-color",
        "lightblue"
      );
      document.documentElement.style.setProperty(
        "--common-color",
        "transparent"
      );
    }
  };

  return (
    <FormControl>
      <FormLabel
        id="row-radio-buttons-group-label"
        sx={{
          fontSize: "14px",
          textAlign: "left",
          mb: "-5px",
          mt: "7px",
        }}
      >
        Text Highlights:
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby="row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={highlightMode}
        onChange={handleColour}
      >
        <CustomFormControlLabel
          value={"diff"}
          label={"Difference"}
          defaultValue
        />
        <CustomFormControlLabel 
          value={"common"} 
          label={"Common"}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default Highlights;


/* Temorarily removed:

        <CustomFormControlLabel
          value={"passim"}
          label={"Only Passim Alignment"}
        />
        <CustomFormControlLabel
          value={"milestone"}
          label={"Whole Milestone Text"}
        />

*/