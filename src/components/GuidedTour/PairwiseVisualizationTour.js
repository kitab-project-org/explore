import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { hideTour, showTour } from "./tourHide";

const TOUR_KEY = "kitab-pairwise-tour-seen";

// Pair of books used when the tour is started from the landing page
// (Ibn Ḥawqal's Ṣūrat al-arḍ and al-Iṣṭakhrī's Masālik: a pair with clear reuse blocks and
// a table of contents). Full version IDs, as in the URLs of the visualisation page.
const DEMO_BOOKS =
  "Shamela0011780-ara1.mARkdown_Shamela0011680-ara1.mARkdown";

const BAR_STEP_TITLE = "Inspect a passage";
const OPEN_STEP_TITLE = "Open the DiffViewer";
const DIFF_STEP_TITLE = "The DiffViewer";
const ZOOM_STEP_TITLE = "Zoom";
const FLIP_STEP_TITLE = "Flip the books";

const steps = [
  {
    title: "Pairwise Text Reuse Visualisation",
    intro:
      `This visualisation shows how two texts are related. <br>Imagine that both texts are written out on two long scrolls, 300 words per line, and that the passages that appear in both texts are highlighted in red.`,
  },
  {
    element: "#pairwise-chart .metadata-section",
    title: "Which texts?",
    intro:
      "The metadata above and below the chart tell you which two text versions are compared. Click <b>Next</b> to see what happens when you click a version code, title or author.",
    position: "bottom",
  },
  {
    // opened dynamically via onBeforeChange (see below)
    element: "#CorpusMetadata-Drawer",
    title: "Version details",
    intro:
      "Clicking a version code, title or author opens a side panel with more details about the text, its author and this version. <br>The arrow icon next to each of them opens the text in the metadata table instead.",
    position: "left",
  },
  {
    element: "#chartBox",
    title: "Two scrolls",
    intro:
      "Each text is drawn on a horizontal axis. The <b>thick black bars</b> mark the beginning (left) and the end (right) of each text; the number at the end bar is the total number of milestones (300-word chunks). <br>Both texts use the same scale, so you can see at a glance which one is longer.",
    position: "top",
  },
  {
    element: "#firstchart",
    title: "Red bars: shared passages",
    intro:
      "Each red bar is a passage that both texts share. Its horizontal position shows <i>where</i> in the text the reuse occurs, and its length and vertical position show <i>how much</i> and <i>which part</i> of the milestone is shared. <br><b>Gaps</b> between red blocks may mean that an author added or left out a section.",
    position: "bottom",
  },
  {
    element: "#chartBox .connections",
    title: "Yellow lines: connections",
    intro:
      "Yellow lines connect the shared passages in the two texts. <br><b>Parallel lines</b> mean that the passages occur in the same order in both texts. <b>Crossing lines</b> mean that a section may have been moved.",
    position: "bottom",
  },
  {
    // A bar is selected dynamically (see below). The target is #chartBox rather than
    // the svg, because the bar's tooltip is a child of #chartBox: intro.js lifts the
    // target above its overlay, so the tooltip is only visible when it is inside it.
    element: "#chartBox",
    title: BAR_STEP_TITLE,
    intro:
      "Hover over or click a bar to see its milestone number, token positions and section heading in both texts. <br>A selected bar stays highlighted and its tooltip remains visible, so you can use the arrow keys to move to other alignments. Press <b>Escape</b> to deselect.",
    position: "top",
  },
  {
    // same target and behaviour as the previous step: the bar stays selected
    element: "#chartBox",
    title: OPEN_STEP_TITLE,
    intro:
      "<b>Double-click</b> a red bar or a yellow line (or press <b>Enter</b> when it is selected) to open the <b>DiffViewer</b>, which shows the two aligned passages side by side. <br>Click <b>Next</b> to scroll to the DiffViewer.",
    position: "top",
  },
  {
    // The DiffViewer does not exist until an alignment is opened: it is opened
    // dynamically (see below) and its element is filled in at that point.
    element: "#bookSectionRef",
    title: DIFF_STEP_TITLE,
    intro:
      "Text that only occurs in the left passage is highlighted in blue, text that only occurs in the right passage in green, and text that occurs in both but at a different place in orange. <br>Tip: click <i>load context</i> on either side to check whether the alignment continues over a milestone boundary.",
    position: "auto",
  },
  {
    element: "#chartBox .toc-markers g",
    title: "Table of contents",
    intro:
      "The blue triangles mark the main sections of a text (if its structure has been annotated). Click a triangle to see the section title and to expand its subsections.",
    position: "bottom",
  },
  {
    element: ".ms-toggler",
    title: "Navigate between alignments",
    intro:
      "Use the arrows or type a milestone number to jump from one aligned milestone to the next. <br>You can also click a bar and use the <b>left/right</b> arrow keys to step through the alignments, the <b>up/down</b> keys to switch between the books, and <b>Escape</b> to deselect.",
    position: "right",
  },
  {
    element: "#viz-zoom-btn",
    title: ZOOM_STEP_TITLE,
    intro:
      "Click this button (or press <b>Z</b>) to switch to zoom mode, then drag over an area of the chart to zoom in. You can also hold <b>Ctrl</b> and use the mouse wheel, as the tour is doing now on the top text. <br>Zooming reveals the finer structure of large texts.",
    position: "bottom",
  },
  {
    // the slide-out panel, opened dynamically (see below)
    element: "#toc-filter-panel",
    title: "Filter by table of contents",
    intro:
      "The <b>filter button</b> in the toolbar opens a panel with the table of contents of both texts. Tick the sections you are interested in to limit the chart to them.",
    position: "left",
  },
  {
    element: "#viz-flip-btn",
    title: FLIP_STEP_TITLE,
    intro: "Swap the top and bottom text, as the tour is doing now.",
    position: "bottom",
  },
  {
    element: "#viz-reset-btn",
    title: "Reset",
    intro: "Restore the original view after zooming or selecting.",
    position: "bottom",
  },
  {
    // the toolbar with the download button plus the options panel, which is shown
    // dynamically (see below)
    element: "#pairwise-viz-header",
    title: "Download the chart",
    intro:
      "The <b>download button</b> opens the download options: download the chart as an image, with or without the metadata, table of contents markers and URL.",
    position: "bottom",
  },
  {
    element: "#viz-help-link",
    title: "More information",
    intro: "Click this icon to read more about this visualisation.",
    position: "bottom",
  },
  {
    element: "#take-viz-tour-btn",
    title: "That's it!",
    intro: "You can revisit this tour at any time by clicking this button.",
    position: "bottom",
  },
];

// Select an alignment bar from the middle of the top book, as if the user had clicked it,
// so that the selection tooltip appears.
const selectMiddleBar = () => {
  const box = document.getElementById("chartBox")?.getBoundingClientRect();
  const bars = [...document.querySelectorAll("#firstchart .bar")]
    .map((bar) => ({ bar, rect: bar.getBoundingClientRect() }))
    .filter(({ rect }) => rect.height > 0)
    .sort((a, b) => a.rect.left - b.rect.left);
  if (!box || !bars.length) return;
  // the median bar (by horizontal position) is in the middle of the reuse
  const { bar, rect } = bars[Math.floor(bars.length / 2)];
  // keep the tooltip (max 300px wide) inside the chart:
  const layerX = Math.min(rect.left - box.left + rect.width / 2, box.width - 330);
  const layerY = rect.top - box.top + rect.height / 2;
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  // the chart reads layerX/layerY (read-only on real events) to position its tooltip
  Object.defineProperty(event, "layerX", { value: Math.max(layerX, 0) });
  Object.defineProperty(event, "layerY", { value: layerY });
  bar.dispatchEvent(event);
};

const deselectBar = () => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
};

// A promise that never settles. A step change that is abandoned because its tour has been
// replaced (and exited) must not return `false`: intro.js then steps the exited tour back
// to step 0, which draws its welcome popup again, next to the new tour's popup. Leaving
// the change pending is harmless.
const NEVER = new Promise(() => {});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// resolve once condition() returns something truthy (or after timeout ms)
const waitFor = async (condition, timeout = 8000) => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeout) {
    await wait(100);
  }
};

const isBarSelected = () =>
  (document.getElementById("pairwise-tooltip")?.textContent ?? "").includes("deselect");

// press Enter, which opens the DiffViewer for the selected alignment
const openDiffViewer = () => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
};

// zoom in on the middle of the top text, as if the user held Ctrl and scrolled the mouse wheel
const zoomIn = () => {
  const svg = document.getElementById("svgChart");
  const rect = document.getElementById("firstchart")?.getBoundingClientRect();
  if (!svg || !rect) return;
  svg.dispatchEvent(
    new WheelEvent("wheel", {
      ctrlKey: true,
      deltaY: -100,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      bubbles: true,
      cancelable: true,
    })
  );
};

const resetChart = () => document.getElementById("viz-reset-btn")?.click();

const PairwiseVisualizationTour = ({ run, onExit, setIsOpenDrawer }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    // Skip steps whose target element is not in the DOM
    // (e.g. no table of contents available for these books).
    // The side panel is always mounted (hidden), and the DiffViewer is opened by the
    // tour itself, so those two are always included.
    // (without a table of contents the panel cannot be shown: describe the button instead)
    const hasToc = !!document.querySelector("#chartBox .toc-markers g");
    const availableSteps = steps
      .map((step) =>
        step.element === "#toc-filter-panel" && !hasToc
          ? {
              ...step,
              element: "#viz-filter-btn",
              position: "bottom",
              intro:
                "Open a panel with the table of contents of both texts and limit the chart to the sections you are interested in. (No table of contents is available for these texts.)",
            }
          : step
      )
      .filter(
      (step) =>
        !step.element ||
        step.element === "#CorpusMetadata-Drawer" ||
        step.element === "#toc-filter-panel" ||
        step.element === "#bookSectionRef" ||
        document.querySelector(step.element)
    );

    // Track what the tour has opened/selected, so that it can be undone.
    let tourDrawerOpen = false;
    let tourBarSelected = false;
    let tourFilterOpen = false; // the table of contents filter panel was opened
    let tourFlipped = false; // the tour flipped the books
    let flipClickedAt = 0;
    let onFlipStep = false; // whether the tour is currently on the "Flip the books" step
    let tourZoomed = false; // the tour zoomed the chart
    let onZoomStep = false; // whether the tour is currently on the "Zoom" step
    let tourDownloadOpen = false; // the download options were opened
    let tourDiffOpen = false; // the DiffViewer was opened (which also zooms the chart)
    let launching = false; // a restarted tour is showing its first step on its way to the wanted one
    let diffReady = false; // the DiffViewer is open (tour restarted at its step)
    let onBarStep = false; // whether the tour is currently on the "Inspect a passage" step

    const closeDownloadOptions = () => {
      if (!tourDownloadOpen) return;
      tourDownloadOpen = false;
      document.getElementById("viz-download-btn")?.click();
    };

    const cleanUp = () => {
      closeDownloadOptions();
      if (tourFilterOpen) {
        tourFilterOpen = false;
        document.getElementById("viz-filter-btn")?.click();
      }
      if (tourFlipped) {
        tourFlipped = false;
        // flipping takes about a second: do not flip back before it has finished
        const remaining = Math.max(0, 1100 - (Date.now() - flipClickedAt));
        setTimeout(() => document.getElementById("viz-flip-btn")?.click(), remaining);
      }
      if (tourZoomed) {
        tourZoomed = false;
        resetChart();
      }
      if (tourDiffOpen) {
        tourDiffOpen = false;
        resetChart(); // un-zoom the chart (this also clears the selection)
      }
      if (tourBarSelected) {
        tourBarSelected = false;
        deselectBar();
      }
      if (tourDrawerOpen) {
        tourDrawerOpen = false;
        setIsOpenDrawer?.(false);
      }
    };

    const handleDone = () => {
      cleanUp();
      showTour();
      localStorage.setItem(TOUR_KEY, "true");
      onExit?.();
    };

    // Replace the running tour by a new one starting at step `index` (0-based), so that
    // the step elements are looked up again. The replaced tour's handlers are ignored.
    const restartAt = async (index) => {
      const oldTour = introRef.current;
      introRef.current = null;
      hideTour(); // no popup that jumps around while the tour restarts
      await oldTour?.exit(true);
      launch(index + 1);
    };

    const launch = (startAt) => {
    const tour = introJs
      .tour()
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
      .onComplete(() => {
        if (tour === introRef.current) handleDone(); // ignore a replaced tour
      })
      .onExit(() => {
        if (tour === introRef.current) handleDone(); // ignore a replaced tour
      });
    introRef.current = tour;

    // (inside launch) Returning a Promise lets the page finish rendering before intro.js highlights.
    introRef.current.onBeforeChange(function (targetElement, currentStep) {
      if (launching) return; // restarting: nothing to undo or open
      const targetId = targetElement?.id;
      const stepTitle = availableSteps[currentStep]?.title;
      onBarStep = stepTitle === BAR_STEP_TITLE || stepTitle === OPEN_STEP_TITLE;
      const onDiffStep = stepTitle === DIFF_STEP_TITLE;
      onZoomStep = stepTitle === ZOOM_STEP_TITLE;
      onFlipStep = stepTitle === FLIP_STEP_TITLE;
      if (!onDiffStep) diffReady = false;

      if (targetId === "toc-filter-panel") {
        if (tourFilterOpen) return;
        tourFilterOpen = true;
        document.getElementById("viz-filter-btn")?.click();
        return wait(450).then(() => introRef.current?.refresh());
      }

      if (targetId === "pairwise-viz-header") {
        if (tourDownloadOpen) return;
        tourDownloadOpen = true;
        document.getElementById("viz-download-btn")?.click();
        return wait(450).then(() => introRef.current?.refresh());
      }

      if (targetId === "CorpusMetadata-Drawer") {
        if (tourDrawerOpen) return;
        tourDrawerOpen = true;
        // click the version code, exactly as a user would:
        document.querySelector("#pairwise-chart .metadata-section a")?.click();
        return wait(450).then(() => introRef.current?.refresh());
      }

      if (onBarStep) {
        if (tourDrawerOpen) {
          tourDrawerOpen = false;
          setIsOpenDrawer?.(false);
        }
        // the bar is selected in onAfterChange, once intro.js has finished
        // scrolling and laying out the step (which can redraw the chart)
        if (tourDiffOpen) {
          // coming back from the DiffViewer step: un-zoom the chart first
          tourDiffOpen = false;
          resetChart();
          return wait(350);
        }
        return;
      }

      if (onDiffStep) {
        if (diffReady) return; // restarted tour: the DiffViewer is open and resolvable
        // the bar from the previous step stays selected; select one if it is not
        return (async () => {
          hideTour(); // no popup that jumps around while the page scrolls
          if (!isBarSelected()) {
            selectMiddleBar();
            tourBarSelected = true;
            await wait(300);
          }
          tourDiffOpen = true;
          openDiffViewer();
          // wait for the aligned text itself (not just the table header)...
          await waitFor(() =>
            document.querySelector("#bookSectionRef .diffTableBody .diffTableCell")
          );
          // ...and for the chart's own (smooth) scroll to the DiffViewer to finish,
          // so that it does not scroll away again after the step is shown
          await wait(1500);
          // The DiffViewer did not exist when this tour started, so intro.js gave the
          // step a floating placeholder. Restart the tour at this step so that
          // its element is resolved again.
          diffReady = true;
          await restartAt(currentStep);
          return NEVER; // abandon the change in the tour that was just exited
        })();
      }

      // any other step: undo whatever the tour opened or selected before
      if (tourBarSelected || tourDrawerOpen || tourDiffOpen || tourDownloadOpen || tourZoomed || tourFilterOpen || tourFlipped) {
        const chartRedrawn = tourDiffOpen; // resetting a zoomed chart redraws its elements
        cleanUp();
        if (!chartRedrawn) return wait(350);
        // the step's element was found before the chart was redrawn: restart the
        // tour at this step so that it is found again
        return (async () => {
          await wait(600);
          await restartAt(currentStep);
          return NEVER;
        })();
      }
    });

    introRef.current.onAfterChange(function (targetElement) {
      if (targetElement?.id === "bookSectionRef") {
        // the highlight was measured when the text may not have been laid out yet
        setTimeout(() => tour.refresh(), 500);
        return;
      }
      if (targetElement?.id === "viz-flip-btn") {
        setTimeout(() => {
          if (!onFlipStep || tourFlipped) return;
          tourFlipped = true;
          flipClickedAt = Date.now();
          document.getElementById("viz-flip-btn")?.click();
        }, 700);
        return;
      }
      if (targetElement?.id === "viz-zoom-btn") {
        // zoom in a few times on the top text, one wheel step at a time
        [600, 1100, 1600].forEach((delay) =>
          setTimeout(() => {
            if (!onZoomStep) return;
            tourZoomed = true;
            zoomIn();
          }, delay)
        );
        return;
      }
      if (!onBarStep) return;
      // select a bar; if the chart redraws and drops the tooltip, select again
      const select = (attemptsLeft) => {
        // stop if the user has already moved on to another step, or if the bar
        // is already selected (a mere hover tooltip does not count: it contains
        // no "deselect" hint)
        const tooltipText = document.getElementById("pairwise-tooltip")?.textContent ?? "";
        if (!onBarStep || tooltipText.includes("deselect")) return;
        tourBarSelected = true;
        deselectBar();
        selectMiddleBar();
        if (attemptsLeft > 0) setTimeout(() => select(attemptsLeft - 1), 400);
      };
      setTimeout(() => select(2), 300);
    });

    // start at the first step (without side effects), then jump to the wanted step
    launching = !!startAt;
    tour.start().then(async () => {
      if (!startAt) return;
      launching = false;
      await tour.goToStep(startAt);
      await wait(700); // let the page scroll and the highlight settle before showing it
      showTour();
    }).catch((error) => {
      showTour();
      console.error("Pairwise tour:", error);
    });
    };
    launch(0);

    return () => {
      introRef.current?.exit(true);
      showTour();
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export { TOUR_KEY, DEMO_BOOKS };
export default PairwiseVisualizationTour;
