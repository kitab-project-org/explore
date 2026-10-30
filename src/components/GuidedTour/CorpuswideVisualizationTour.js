import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { hideTour, showTour } from "./tourHide";
import { DEMO_BOOKS as PAIRWISE_DEMO_BOOKS } from "./PairwiseVisualizationTour";
import { installTourLinks } from "./tourLinks";
import { hideCursor, moveCursorTo, pulseCursor, resetCursor } from "./fakeCursor";

const TOUR_KEY = "kitab-corpuswide-tour-seen";

// Main book used when the tour is started from another page
// (al-Iṣṭakhrī's Masālik: reused by many later texts)
const DEMO_BOOKS = "Shamela0011680-ara1.mARkdown_all";

const MS_HOVER_TITLE = "Overview per milestone";
const MS_STEP_TITLE = "Select a milestone";
const TEXT_STEP_TITLE = "Read the milestone";
const BAR_HOVER_TITLE = "Overview per book";
const BAR_STEP_TITLE = "Select a book";
const HOVER_STEP_TITLE = "Identify the reused passages";
const ARROW_NAVIGATION_TITLE = "Arrow navigation";
const OPEN_STEP_TITLE = "Compare the passage texts";
const DIFF_STEP_TITLE = "The DiffViewer";
const FILTER_STEP_TITLE = "Filters and settings";
const DOWNLOAD_STEP_TITLE = "Download the chart";

const steps = [
  {
    title: "Corpus-wide Text Reuse Visualisation",
    intro:
      "This visualisation shows which passages of one text, the <b>main book</b>, are reused in all the other texts of the corpus, and where.",
  },
  {
    element: "#scatterChart",
    title: "The scatter plot",
    intro:
      "Each <b>dot</b> is an alignment: a passage that a milestone of the main book (vertical axis) shares with a milestone of another text (horizontal axis).",
    position: "right",
  },
  {
    element: "#scatterChart .yAxis",
    title: "The Y axis: the main book",
    intro:
      "The main book is represented by a series of dots on the Y axis; each dot represents a 300-word chunk of the text (the <b>milestone</b>). The beginning of the book is at the top, the end at the bottom.",
    position: "right",
  },
  {
    element: "#scatterChart .xAxis",
    title: "The X axis: the other texts",
    intro:
      "Each other text in the corpus that shares text with the main book is aligned chronologically along the X axis (earliest book on the left, latest on the right).",
    position: "top",
  },
  {
    element: "#scatter-legend",
    title: "Colour legend",
    intro:
      "The colour of a dot shows how many characters the two milestones share. The darker, the more characters they share.",
    position: "bottom",
  },
  {
    element: "#scatterChart",
    title: "Reading the patterns",
    intro:
      "<b>Horizontal rows</b> of dots indicate passages of the main book that were reused in many texts. <br><b>Dense columns</b> indicate books that are closely related to the main book. <br><b>Empty bands</b> are parts of the main book that were hardly reused.",
    position: "right",
  },
  {
    // The hover is simulated by the tour (see below). The target is a transparent box
    // that the tour places over the plot area between the two axes.
    element: "#tour-plot-area",
    title: HOVER_STEP_TITLE,
    intro:
      "Hovering over a dot identifies where the reused passage is found in both books.",
    position: "auto",
  },
  {
    element: "#multiVis",
    title: ARROW_NAVIGATION_TITLE,
    intro:
      "<b>Clicking</b> a dot selects it and enables arrow navigation: press the <b>left/right</b> arrow keys to move to the previous/next reuse passage of the same milestone, and the <b>up/down</b> arrow keys to move to the previous/next reuse passage in the same book. <br>Watch the selection move: right, down, left and up.",
    position: "auto",
  },
  {
    element: "#multiVis",
    title: OPEN_STEP_TITLE,
    intro:
      "<b>Double-clicking</b> a dot or pressing <b>Enter</b> while it is selected will show the exact text of both passages. <br>Click <b>Next</b> to see the passage texts (it may take a second to load).",
    position: "auto",
  },
  {
    // opened dynamically (see below)
    element: "#bookSectionRef",
    title: DIFF_STEP_TITLE,
    intro:
      "The passage texts are displayed in a DiffViewer. Text that only occurs in the left passage is highlighted in blue, text that only occurs in the right passage in green, and text that occurs in both but at a different place in orange. <br>Tip: click <i>load context</i> to see more context around the aligned passages.",
    position: "auto",
  },
  {
    // (the tooltip is raised above intro.js's overlay: see below)
    element: "#side-bar",
    title: MS_HOVER_TITLE,
    intro:
      "The bar chart on the right sums up reuse of each milestone of the main book: the number of alignments it has with other texts (or the number of characters matched, see the filter settings). <br>Hovering over a bar shows the milestone number, its total and, if the main book has a table of contents, the section(s) it belongs to.",
    position: "left",
  },
  {
    element: "#side-bar",
    title: MS_STEP_TITLE,
    intro:
      "<b>Clicking</b> a bar selects the milestone: its row of dots is outlined in the scatter plot. Use the <b>up/down</b> arrow keys to move to the previous/next milestone (watch the selection move) and <b>Escape</b> to deselect.",
    position: "left",
  },
  {
    // The text panel does not exist until it is opened: it is opened dynamically
    // (see below) and the tour is restarted at this step to find it.
    element: "#milestone-text-panel",
    title: TEXT_STEP_TITLE,
    intro:
      "With a milestone selected, press <b>Enter</b> to read its text below the charts. <br>Select a passage in the text and click <b>Filter to selection</b> to limit the scatter plot to the alignments that overlap with your selection.",
    position: "auto",
  },
  {
    element: "#bottom-bar",
    title: BAR_HOVER_TITLE,
    intro:
      "The bar chart at the bottom sums up each of the other texts: how much of it is aligned with the main book (the number of alignments or of characters matched, see the filter settings). <br>Hovering over a bar shows the title of the text and its total.",
    position: "top",
  },
  {
    element: "#bottom-bar",
    title: BAR_STEP_TITLE,
    intro:
      "<b>Clicking</b> a bar selects the text: its column of dots is outlined in the scatter plot. Use the <b>left/right</b> arrow keys to move to the previous/next text (watch the selection move) and <b>Escape</b> to deselect. <br><b>Double-click</b> a bar (or press <b>Enter</b>) to open the pairwise visualisation of the two texts in a new tab. <br>Curious how that visualisation works? <a href=\"#\" target=\"_blank\" data-tour-link=\"pairwise\" style=\"color:#2862a5; text-decoration:underline;\">Take the Pairwise Visualization Tour</a>.",
    position: "top",
  },
  {
    // the filter panel, opened dynamically (see below)
    element: "#multi-filter-panel",
    scrollTo: "off", // the tour scrolls itself: the cog button above the panel must stay visible
    title: FILTER_STEP_TITLE,
    intro:
      "The <b>cog button</b> opens the filters and settings: limit the chart to a range of dates or milestones; to books with a specified number of aligned characters or passages. <br>If the main book has a table of contents, a panel on the right lets you limit the chart to selected sections.",
    position: "bottom",
  },
  {
    element: "#viz-reset-btn",
    title: "Reset",
    intro: "Restore the full chart: remove all filters and selections.",
    position: "bottom",
  },
  {
    // the toolbar with the download button plus the options panel, which is shown
    // dynamically (see below)
    element: "#multi-viz-header",
    title: DOWNLOAD_STEP_TITLE,
    intro:
      "The <b>download button</b> opens the download options: download the chart as an image. The default size settings are good for inclusion in a standard academic book publication. <br/>You can also choose to include/exclude the legend, side bar, bottom bar and the URL.",
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

// what the tour selects (so that the tooltip persists) in a step, and the hint
// that the persistent tooltip of that kind of selection contains
const SELECTION_KIND = {
  [MS_HOVER_TITLE]: "mshover",
  [MS_STEP_TITLE]: "ms",
  [TEXT_STEP_TITLE]: "ms",
  [BAR_HOVER_TITLE]: "barhover",
  [BAR_STEP_TITLE]: "bar",
  [HOVER_STEP_TITLE]: "hover",
  [ARROW_NAVIGATION_TITLE]: "dot",
  [OPEN_STEP_TITLE]: "dot",
  [DIFF_STEP_TITLE]: "dot",
};
const SELECTION_HINT = {
  ms: "Enter to view text",
  bar: "Press Enter for pairwise",
  dot: "Press Enter to compare",
  hover: "Double-click to compare aligned texts",
  mshover: "click to enable navigation",
  barhover: "Click to select",
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

const click = (node) =>
  node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

const pressKey = (key) =>
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

// is a selection of this kind shown in the (persistent) tooltip?
const isSelected = (kind) => {
  const tooltip = document.querySelector(".vizTooltip");
  return (
    !!tooltip &&
    parseFloat(getComputedStyle(tooltip).opacity) > 0.5 &&
    (tooltip.textContent ?? "").includes(SELECTION_HINT[kind])
  );
};

// index of the element with the largest numeric attribute
const indexOfMax = (nodes, attr) => {
  let best = 0;
  let bestValue = -Infinity;
  nodes.forEach((node, i) => {
    const value = parseFloat(node.getAttribute(attr)) || 0;
    if (value > bestValue) {
      bestValue = value;
      best = i;
    }
  });
  return best;
};

// Simulate the mouse pointer over a node. The charts place their tooltips with
// event.pageX/pageY, which a synthetic event only gets right if they are set explicitly.
let hoveredNode = null;
const hover = (node, clientX, clientY) => {
  if (!node) return;
  const event = new MouseEvent("mouseover", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
  });
  Object.defineProperty(event, "pageX", { value: clientX + window.scrollX });
  Object.defineProperty(event, "pageY", { value: clientY + window.scrollY });
  hoveredNode = node;
  node.dispatchEvent(event);
};
const unhover = () => {
  hoveredNode?.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, cancelable: true }));
  hoveredNode = null;
};

// The (transparent) hit area of the largest bar of a bar chart. The hit areas are matched
// to the bars by their data, not by position: the side bar moves a selected bar to the
// end of its DOM children, so the n-th bar and the n-th hit area need not belong together.
// lowerHalf: only consider the bars in the lower half of the chart (so that the tooltip of
// the bar does not end up under the step's message, which sits at the top of the chart).
const hitForLargest = (container, attr, key, lowerHalf = false) => {
  let bars = [...document.querySelectorAll(`${container} .bar`)];
  const hits = [...document.querySelectorAll(`${container} .bar-hit`)];
  if (lowerHalf) {
    const chart = document.querySelector(container)?.getBoundingClientRect();
    const lower = bars.filter((bar) => {
      const rect = bar.getBoundingClientRect();
      return chart && rect.top + rect.height / 2 > chart.top + chart.height / 2;
    });
    if (lower.length) bars = lower;
  }
  const id = bars[indexOfMax(bars, attr)]?.__data__?.[key];
  return hits.find((hit) => hit.__data__?.[key] === id);
};

// Simulated hovers and clicks take a while (the pointer glides first). When the step
// changes in the meantime, they must not complete: the epoch changes at every step change.
let epoch = 0;
const cancelSimulations = () => {
  epoch += 1;
  selecting = false;
};

// Glide the fake pointer to the middle of a node (at `fractionX` of its width) and click it
const clickWithPointer = async (node, fractionX = 0.5, withPointer = true) => {
  if (!node) return;
  if (!withPointer) return click(node);
  const myEpoch = epoch;
  const rect = node.getBoundingClientRect();
  await moveCursorTo(rect.left + rect.width * fractionX, rect.top + rect.height / 2);
  if (myEpoch !== epoch) return hideCursor();
  await pulseCursor();
  if (myEpoch !== epoch) return hideCursor();
  click(node);
};

// Glide the fake pointer to a node, then hover over it
const hoverWithPointer = async (node, fractionX = 0.5) => {
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const x = rect.left + rect.width * fractionX;
  const y = rect.top + rect.height / 2;
  const myEpoch = epoch;
  await moveCursorTo(x, y);
  if (myEpoch !== epoch) return hideCursor();
  hover(node, x, y);
};

// Select something as if the user had clicked it (or hover over it):
// * ms: the milestone with the most alignments (widest bar of the side bar)
// * bar: the text with the most aligned material (tallest bar of the bottom bar)
// * dot: the dot with the most matched characters
// A fake pointer glides to the spot first. Calls while a previous one is still
// under way are ignored.
let selecting = false;
const select = async (kind, withPointer = true) => {
  if (selecting) return;
  selecting = true;
  const myEpoch = epoch;
  try {
    if (kind === "mshover" || kind === "ms") {
      const hit = hitForLargest("#side-bar", "width", "ms_id", true);
      if (kind === "ms") await clickWithPointer(hit, 0.3, withPointer);
      else await hoverWithPointer(hit, 0.3);
    } else if (kind === "barhover" || kind === "bar") {
      const hit = hitForLargest("#bottom-bar", "height", "id");
      if (kind === "bar") await clickWithPointer(hit, 0.5, withPointer);
      else await hoverWithPointer(hit);
    } else if (kind === "dot" || kind === "hover") {
      // (the dots of the main book itself are not clickable: their cursor is not a pointer)
      const dots = [...document.querySelectorAll("#scatterChart circle.dot")].filter(
        (dot) => dot.style.cursor === "pointer"
      );
      let best = null;
      dots.forEach((dot) => {
        if (!best || (dot.__data__?.ch_match ?? 0) > (best.__data__?.ch_match ?? 0)) best = dot;
      });
      if (kind === "dot") await clickWithPointer(best, 0.5, withPointer);
      else await hoverWithPointer(best);
    }
  } finally {
    if (myEpoch === epoch) selecting = false;
  }
};

const deselect = () => pressKey("Escape");

// Scroll the page a little if the step's message box is (partly) out of view, e.g. when
// the highlighted element is at the very bottom of the page.
const ensurePopupVisible = () => {
  const popup = document.querySelector(".introjs-tooltip");
  if (!popup) return;
  const rect = popup.getBoundingClientRect();
  if (rect.height === 0) return;
  const margin = 20;
  if (rect.top < margin) window.scrollBy({ top: rect.top - margin, behavior: "auto" });
  else if (rect.bottom > window.innerHeight - margin)
    window.scrollBy({ top: rect.bottom - window.innerHeight + margin, behavior: "auto" });
};

// Make sure that the target of a step is on the screen, so that the highlight and the
// message are visible (intro.js's own scrolling does not always bring a tall target back
// into view, e.g. after the page has been scrolled down to the DiffViewer).
const scrollToTarget = async (element) => {
  if (!element?.getBoundingClientRect) return;
  if (element.classList?.contains("introjsFloatingElement")) return; // step without target
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight;
  if (rect.top >= 0 && rect.bottom <= viewHeight) return; // already fully visible
  element.scrollIntoView({
    block: rect.height > viewHeight * 0.7 ? "start" : "center",
    behavior: "auto",
  });
  await wait(150);
};

// Open the milestone text panel (Enter on a selected milestone)
const openTextPanel = async () => {
  // (select again, without the pointer: the selection may be there already, but its
  // tooltip may have been hidden by a hover over another chart)
  selecting = false;
  await select("ms", false);
  await wait(300);
  pressKey("Enter");
  await waitFor(() => document.getElementById("milestone-text-panel"), 15000);
  await wait(1500); // the text loads, and the page scrolls to the panel
};

// Open the DiffViewer (Enter on a selected dot)
const openDiffViewer = async () => {
  selecting = false;
  await select("dot", false);
  await wait(300);
  pressKey("Enter");
  await waitFor(() => document.querySelector("#bookSectionRef .diffTableCell"), 30000);
  await wait(1800); // the page scrolls smoothly to the DiffViewer
};

// steps in which the tour moves the selection with the arrow keys
const ARROW_DEMOS = {
  [ARROW_NAVIGATION_TITLE]: {
    kind: "dot",
    keys: ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"],
  },
  [MS_STEP_TITLE]: {
    kind: "ms",
    keys: ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp"],
  },
  [BAR_STEP_TITLE]: {
    kind: "bar",
    keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"],
  },
};

const DYNAMIC_STEPS = {
  [TEXT_STEP_TITLE]: openTextPanel,
  [DIFF_STEP_TITLE]: openDiffViewer,
};

// A transparent box over the plot area between the two axes of the scatter plot,
// so that the "hover" step can highlight exactly that area (the tooltip is raised above
// the overlay separately).
const PLOT_AREA_ID = "tour-plot-area";
const positionPlotArea = () => {
  const chartBox = document.getElementById("chartBox");
  const yAxis = document.querySelector("#scatterChart .yAxis .domain")?.getBoundingClientRect();
  const xAxis = document.querySelector("#scatterChart .xAxis .domain")?.getBoundingClientRect();
  if (!chartBox || !yAxis || !xAxis) return;
  let box = document.getElementById(PLOT_AREA_ID);
  if (!box) {
    box = document.createElement("div");
    box.id = PLOT_AREA_ID;
    box.style.position = "absolute";
    box.style.pointerEvents = "none";
    chartBox.appendChild(box);
  }
  const outer = chartBox.getBoundingClientRect();
  box.style.left = `${yAxis.right - outer.left}px`;
  box.style.top = `${yAxis.top - outer.top}px`;
  box.style.width = `${Math.max(xAxis.right - yAxis.right, 0)}px`;
  box.style.height = `${Math.max(xAxis.top - yAxis.top, 0)}px`;
};
const removePlotArea = () => document.getElementById(PLOT_AREA_ID)?.remove();

// The tooltip of the charts is not inside the element that a step highlights, so it
// would stay below intro.js's overlay: raise it above it (but below the step's popup).
const raiseTooltip = (raised) => {
  const tooltip = document.querySelector(".vizTooltip");
  if (tooltip) tooltip.style.zIndex = raised ? "99999999" : "";
};

const CorpuswideVisualizationTour = ({ run, onExit, onSwitchTour }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    // Skip steps whose target element is not in the DOM. The elements that the tour
    // creates itself (text panel, DiffViewer) are always included.
    positionPlotArea();
    raiseTooltip(true);
    const availableSteps = steps.filter(
      (step) =>
        !step.element ||
        step.element === "#milestone-text-panel" ||
        step.element === "#bookSectionRef" ||
        document.querySelector(step.element)
    );

    // Track what the tour has opened, so that it can be undone.
    let tourTextOpen = false;
    let tourFilterOpen = false;
    let tourDownloadOpen = false;
    let tourSelected = false;
    let currentKind = null; // the kind of selection of the current step
    let stepToken = 0; // changes whenever the step changes
    let clickedToken = -1; // the step in which the tour has clicked
    let launching = false; // a restarted tour is on its way to the wanted step
    let dynamicReady = false; // the panel of a dynamic step is open (tour restarted)
    let currentTitle = null;

    const closeTextPanel = () => {
      if (!tourTextOpen) return;
      tourTextOpen = false;
      document.getElementById("milestone-text-close")?.click();
    };
    const closeFilterPanel = () => {
      if (!tourFilterOpen) return;
      tourFilterOpen = false;
      document.getElementById("viz-filter-btn")?.click();
    };
    const closeDownloadOptions = () => {
      if (!tourDownloadOpen) return;
      tourDownloadOpen = false;
      document.getElementById("viz-download-btn")?.click();
    };

    const cleanUp = () => {
      unhover();
      closeTextPanel();
      closeFilterPanel();
      closeDownloadOptions();
      if (tourSelected) {
        tourSelected = false;
        deselect();
      }
    };

    const handleDone = () => {
      cleanUp();
      showTour();
      removePlotArea();
      raiseTooltip(false);
      resetCursor();
      localStorage.setItem(TOUR_KEY, "true");
      onExit?.();
    };

    // Replace the running tour by a new one starting at step `index` (0-based), so that
    // the step elements are looked up again. The replaced tour's handlers are ignored.
    let restartPending = false; // a restart is under way (until the new tour has arrived)
    const restartAt = async (index) => {
      if (restartPending) return;
      restartPending = true;
      console.debug("[corpuswide tour] restarting at step", index);
      const oldTour = introRef.current;
      introRef.current = null;
      hideTour();
      await oldTour?.exit(true);
      // make sure that nothing of the replaced tour is left on the page
      document
        .querySelectorAll(
          ".introjs-overlay, .introjs-helperLayer, .introjs-tooltipReferenceLayer, .introjsFloatingElement"
        )
        .forEach((node) => node.remove());
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
          if (tour === introRef.current) handleDone();
        });
      introRef.current = tour;

      // Returning a Promise lets the page finish rendering before intro.js highlights.
      tour.onBeforeChange(function (targetElement, currentStep) {
        if (tour !== introRef.current) return NEVER; // a replaced tour must not go on
        if (launching) return; // restarting: nothing to undo or open
        const title = availableSteps[currentStep]?.title;
        currentKind = SELECTION_KIND[title] ?? null;
        currentTitle = title;
        stepToken += 1;
        cancelSimulations();

        // steps without a selection of their own: deselect what an earlier step selected
        if (!currentKind && tourSelected) {
          tourSelected = false;
          deselect();
        }
        if (title === HOVER_STEP_TITLE) positionPlotArea();

        // undo what an earlier step opened
        let closed = false;
        if (title !== TEXT_STEP_TITLE && tourTextOpen) { closeTextPanel(); closed = true; }
        if (title !== FILTER_STEP_TITLE && tourFilterOpen) { closeFilterPanel(); closed = true; }
        if (title !== DOWNLOAD_STEP_TITLE && tourDownloadOpen) { closeDownloadOptions(); closed = true; }

        unhover(); // (the hover of a step is simulated after the step is shown)
        hideCursor();

        const open = DYNAMIC_STEPS[title];
        if (!open) dynamicReady = false;

        if (open) {
          // restarted tour: the target now exists; make sure that it is on the screen
          if (dynamicReady) return scrollToTarget(targetElement);
          return (async () => {
            hideTour(); // no popup that jumps around while the page scrolls
            if (closed) await wait(400);
            await open();
            if (title === TEXT_STEP_TITLE) tourTextOpen = true;
            tourSelected = true;
            // The target did not exist when this tour started, so intro.js gave the
            // step a floating placeholder. Restart the tour at this step so that
            // its element is looked up again.
            dynamicReady = true;
            await restartAt(currentStep);
            return NEVER; // abandon the change in the tour that was just exited
          })();
        }

        if (title === FILTER_STEP_TITLE) {
          if (tourFilterOpen) return;
          tourFilterOpen = true;
          document.getElementById("viz-filter-btn")?.click();
          return wait(450).then(() => {
            // scroll so that the cog button (above the panel) is visible, near the top
            const cog = document.getElementById("viz-filter-btn")?.getBoundingClientRect();
            if (cog) window.scrollBy({ top: cog.top - 120, behavior: "auto" });
            return wait(100).then(() => introRef.current?.refresh());
          });
        }

        if (title === DOWNLOAD_STEP_TITLE) {
          if (tourDownloadOpen) return;
          tourDownloadOpen = true;
          document.getElementById("viz-download-btn")?.click();
          return wait(450).then(() => introRef.current?.refresh());
        }

        return (async () => {
          if (closed) await wait(400);
          await scrollToTarget(targetElement);
        })();
      });

      tour.onAfterChange(function () {
        if (tour !== introRef.current || launching) return; // replaced / still restarting
        setTimeout(() => {
          if (tour === introRef.current) ensurePopupVisible();
        }, 500);
        if (DYNAMIC_STEPS[currentTitle]) return; // the opener has made the selection
        if (!currentKind) return;
        // Select (once the step is laid out); if the chart redraws and drops the
        // selection, select again.
        const kind = currentKind;
        const token = stepToken;
        const attempt = (attemptsLeft) => {
          if (token !== stepToken || isSelected(kind)) return; // moved on / already selected
          if (!kind.endsWith("hover")) {
            if (clickedToken === token) return; // click only once per step
            clickedToken = token;
            tourSelected = true;
          }
          select(kind);
          if (attemptsLeft > 0) setTimeout(() => attempt(attemptsLeft - 1), 500);
        };
        setTimeout(() => attempt(3), 300);

        // once the selection is there, move it with the arrow keys, as a user would
        const demo = ARROW_DEMOS[currentTitle];
        if (demo) {
          (async () => {
            await waitFor(() => token !== stepToken || isSelected(demo.kind), 8000);
            await wait(900);
            for (const key of demo.keys) {
              if (token !== stepToken || !isSelected(demo.kind)) return;
              pressKey(key);
              await wait(1100);
            }
          })();
        }
      });

      // start at the first step (without side effects), then jump to the wanted step
      launching = !!startAt;
      tour
        .start()
        .then(async () => {
          if (!startAt) return;
          launching = false;
          await tour.goToStep(startAt);
          await wait(700); // let the page scroll and the highlight settle before showing it
          showTour();
          ensurePopupVisible();
          restartPending = false;
        })
        .catch((error) => {
          restartPending = false;
          showTour();
          console.error("Corpuswide tour:", error);
        });
    };

    launch(0);

    // links to other tours in the step texts (see tourLinks.js)
    const removeTourLinks = installTourLinks({
      demoBooks: { pairwise: PAIRWISE_DEMO_BOOKS },
      endTour: () => introRef.current?.exit(true),
      onSwitch: onSwitchTour,
    });

    return () => {
      removeTourLinks();
      introRef.current?.exit(true);
      showTour();
      removePlotArea();
      raiseTooltip(false);
      resetCursor();
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export { TOUR_KEY, DEMO_BOOKS };
export default CorpuswideVisualizationTour;
