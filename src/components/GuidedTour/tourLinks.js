// Links to other tours inside the text of a tour step:
//
//   <a href="#" target="_blank" data-tour-link="pairwise">Take the Pairwise Visualization Tour</a>
//
// * with target="_blank": the other tour opens in a new tab (the tour here carries on).
//   The new tab starts it from its ?tour=... URL parameter, on the demo books of that tour.
// * without target="_blank": this tour ends and the other one starts in this tab,
//   through the `onSwitch(key)` callback.
//
// installTourLinks() returns a function that removes the click listener again.

// "#/2025.1.9/?version=pri" or "#/metadata/2025.1.9/" -> "2025.1.9"
const releaseCodeFromHash = () => {
  const path = window.location.hash.split("?")[0];
  return path.split("/").find((part) => /^\d{4}\.\d+\.\d+$/.test(part)) ?? null;
};

const tourUrl = (key, demoBooks) => {
  const books = demoBooks?.[key];
  if (!books) return null;
  const release = releaseCodeFromHash();
  const page = release ? `#/visualise/${release}/` : "#/visualise/";
  return `${window.location.href.split("#")[0]}${page}?books=${books}&tour=${key}`;
};

/* Args:
 *   demoBooks: { pairwise: "<books parameter>", corpuswide: "<books parameter>" }:
 *              what a tour is opened with in a new tab
 *   endTour:   function that ends the tour that contains the link (async is fine)
 *   onSwitch:  function(key) that starts the tour `key` in this tab
 */
export const installTourLinks = ({ demoBooks, endTour, onSwitch }) => {
  const onClick = async (event) => {
    const link = event.target?.closest?.("[data-tour-link]");
    if (!link) return;
    event.preventDefault();
    const key = link.getAttribute("data-tour-link");
    if (link.getAttribute("target") === "_blank") {
      const url = tourUrl(key, demoBooks);
      if (url) window.open(url, "_blank", "noopener");
      return;
    }
    await endTour?.();
    onSwitch?.(key);
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
};
