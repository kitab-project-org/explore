import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Tooltip,
} from "@mui/material";
import { useContext } from "react";
import { Context } from "../../App";

export default function VersionDropdown() {
  const { releaseCode, setReleaseCode, setReleaseCodeChanged, allReleasesInsights } =
    useContext(Context);

  // change release code from dropdown
  const handleChange = (event) => {
    console.log("User changed the release code to " + event.target.value);
    localStorage.setItem("release_code", JSON.stringify(event.target.value));
    setReleaseCodeChanged(true);
    setReleaseCode(event.target.value);
  };
  // dynamically load release numbers from the release insights
  // instead of hardcoding them
  const releaseOptions = allReleasesInsights.length > 0
    ? [...allReleasesInsights]
        .filter(r => r.release_code)
        .sort((a, b) => b.release_code.localeCompare(a.release_code))
    : [{ release_code: releaseCode }];

  return (
    <Tooltip title="Select the OpenITI release version" placement="left">
      <FormControl
        sx={{
          minWidth: {
            xs: "120px",
            sm: 150,
          },
        }}
        size="small"
      >
        <InputLabel id="demo-select-small-label">Version</InputLabel>
        <Select value={releaseCode} label="Version" onChange={handleChange}>
          {releaseOptions.map((r) => (
            <MenuItem key={r.release_code} value={r.release_code}>
              {r.release_code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
