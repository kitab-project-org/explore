import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import oneToAllScreenshot from "../../assets/img/one-to-all-screenshot.png";
import pairwiseScreenshot from "../../assets/img/pairwise-screenshot.png";

//const DYNAMIC_ELEMENTS = new Set([".tour-reuse-viz-icon", ".tour-reuse-download"]);


// Static steps whose elements are always in the DOM when the tour runs.
const staticSteps = [
  {
    element: "#simple-tabpanel-3",
    title: "Text Reuse Panel",
    intro:
      "This panel gives access to all text reuse data and visualizations for the selected text.",
    position: "left",
  },
  {
    element: "#reuse-viz-all",
    title: "Visualize All Text Reuse",
    intro:
      `Click this link to open to open a visualisation of corpus-wide text reuse for this book — showing all books that share passages with it. <br><a href="https://kitab-project.org/data/viz#scatter-viz" target="_blank"><img src="${oneToAllScreenshot}" style="max-width:100%"/></a><br>Click the image to learn more about the visualization.`,
    position: "left",
  },
  {
    element: "#reuse-pairwise-section",
    title: "Pairwise Text Reuse Data",
    intro:
      `This section lists all other texts in the corpus that have some text reuse relation with the selected text.`,
    position: "left",
  },
  {
    element: "#reuse-pairwise-search",
    title: "Search Specific Reuse",
    intro:
      "Use this search box to find a specific book that has text reuse in common with the selected book.",
    position: "left",
  },
  // Steps 5 & 6 are built dynamically — see useEffect below.
  {
    element: ".tour-reuse-viz-icon",
    title: "Pairwise Visualization",
    intro:
      `Click the <b>barcode icon</b> in this column to open a visualisation of the text reuse between the selected text and the book in the table row. <br><a href="https://kitab-project.org/data/viz#pairwise-viz" target="_blank"><img src="${pairwiseScreenshot}" style="max-width:100%"/></a><br>Click the image to learn more about the visualization.`,
    position: "left",
  },
  {
    element: ".tour-reuse-download",
    title: "Download Text Reuse Data",
    intro:
      "Click the <b>file icon</b> to download a CSV file with the full text reuse data for that pair of texts, or the <b>half-dashed file icon</b> for a lighter version without the text of the alignments.",
    position: "left",
  },
  {
    element: "#reuse-folder",
    title: "Text Reuse Folder",
    intro:
      "Click this link to access a folder containing all text reuse files related to the selected book.",
    position: "left",
  },
];

/*const TextReuseTour = ({ run, onExit }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    // // Prefer the actual icon elements; fall back to the column header if the
    // // async server checks haven't resolved yet (icons still showing a spinner).
    // const el = (preferred, fallback) =>
    //   document.querySelector(preferred) ? preferred : fallback;
    //
    // const steps = [
    //   ...staticSteps.slice(0, 4),
    //   {
    //     element: el(".tour-reuse-viz-icon", "#reuse-actions-header"),
    //     title: "Pairwise Visualization",
    //     intro:
    //       `Click the <b>barcode icon</b> in this column to open a visualisation of the text reuse between the selected text and the book in the table row. <br><a href="https://kitab-project.org/data/viz#pairwise-viz" target="_blank"><img src="${pairwiseScreenshot}" style="max-width:100%"/></a><br>Click the image to learn more about the visualization.`,
    //     position: "left",
    //   },
    //   {
    //     element: el(".tour-reuse-download", "#reuse-actions-header"),
    //     title: "Download Text Reuse Data",
    //     intro:
    //       "Click the <b>file icon</b> to download a CSV file with the full text reuse data for that pair of texts, or the <b>half-dashed file icon</b> for a lighter version without the text of the alignments.",
    //     position: "left",
    //   },
    //   ...staticSteps.slice(4),
    // ];
    const steps = staticSteps;

    // // Filter out steps whose target element does not exist in the DOM
    // const availableSteps = steps.filter((step) => {
    //   if (!step.element) return true;
    //   if (DYNAMIC_ELEMENTS.has(step.element)) return true;
    //   return !!document.querySelector(step.element);
    // });
    const availableSteps = steps;

    const handleDone = () => {
      onExit?.();
    };

    introRef.current = introJs.tour()
      .setOptions({
        steps: availableSteps,
        showProgress: false,
        showBullets: true,
        exitOnOverlayClick: false,
        scrollToElement: true,
        disableInteraction: false,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Done",
      })
      .onComplete(handleDone)
      .onExit(handleDone);

    introRef.current.start();

    return () => {
      introRef.current?.exit(true);
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};*/

// ChatGPT version:

const waitForElement = (selector, timeout = 5000, interval = 100) =>
  new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      if (Date.now() - start >= timeout) return resolve(null);

      setTimeout(check, interval);
    };

    check();
  });

const TextReuseTour = ({ run, onExit }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    let cancelled = false;

    const startTour = async () => {
      // Wait for the async table content to appear
      await waitForElement(".tour-reuse-viz-icon", 5000);
      await waitForElement(".tour-reuse-download", 5000);

      if (cancelled) return;

      const handleDone = () => onExit?.();

      introRef.current = introJs()
        .setOptions({
          steps: staticSteps,
          showProgress: false,
          showBullets: true,
          exitOnOverlayClick: false,
          scrollToElement: false,
          disableInteraction: false,
          nextLabel: "Next",
          prevLabel: "Back",
          doneLabel: "Done",
        })
        .onComplete(handleDone)
        .onExit(handleDone);

      introRef.current.start();
    };

    startTour();

    return () => {
      cancelled = true;
      introRef.current?.exit(true);
    };
  }, [run, onExit]);

  return null;
};

export default TextReuseTour;
