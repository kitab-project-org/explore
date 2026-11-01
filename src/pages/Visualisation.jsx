import { useContext, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Context } from "../App";
import Layout from "../components/Common/Layouts";
import VisualisationPage from "../components/Visualisation/index";

const Visualisation = () => {
  console.log("render Visualisation");
  const {
    defaultReleaseCode,
    releaseCode,
    setReleaseCode,
    releaseCodeChanged,
    setReleaseCodeChanged,
  } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const { version } = useParams(); // the releaseCode part of the URL

  console.log("Currently stored release code: " + releaseCode);
  console.log("release code from url:" + version);

  // Make sure the correct release code is set before data is downloaded:
  useEffect(() => {
    if (!version) {
      if (releaseCode) {
        console.log(
          `navigating to: /visualise/${releaseCode}/${location.search}`
        );
        navigate(`/visualise/${releaseCode}/${location.search}`);
      } else {
        console.log(
          `navigating to: /visualise/${defaultReleaseCode}/${location.search}`
        );
        navigate(`/visualise/${defaultReleaseCode}/${location.search}`);
      }
    }
    if (version !== releaseCode) {
      if (releaseCodeChanged) {
        // navigate to new URL
        setReleaseCodeChanged(false);
        console.log(
          `navigating to: /visualise/${releaseCode}/${location.search}`
        );
        navigate(`/visualise/${releaseCode}/${location.search}`);
      } else {
        // change the releaseCode
        console.log("Setting the releaseCode in effect to " + version);
        localStorage.setItem("release_code", JSON.stringify(version));
        setReleaseCode(version);
      }
    }
  });

  if (releaseCodeChanged || !version) {
    // do not load the graph; just go to the corrected URL.
    console.log("releasecode changed!");
    return null;
  } else {
    return (
      <Layout>
        <VisualisationPage />
      </Layout>
    );
  }
};

export default Visualisation;
