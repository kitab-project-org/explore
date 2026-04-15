import { useEffect, useRef } from "react";
import introJs from "intro.js";
import oneToAllScreenshot from "../../assets/img/one-to-all-screenshot.png";
import "intro.js/introjs.css";

const TOUR_KEY = "kitab-corpus-tour-seen";

const steps = [
  {
    title: "Welcome to the KITAB explore portal",
    intro:
      `The portal gives you access to the <a href="https://openiti.org/projects/OpenITI%20Corpus.html" target="_blank">OpenITI corpus</a> metadata and to the <a href="https://kitab-project.org" target="_blank">KITAB</a> text reuse data and visualizations. <br>This short tour introduces the main features of the portal. `,
  },
  {
    element: "#outlined-search",
    title: "Search",
    intro:
      "You can find OpenITI texts by searching their metadata, in Latin or Arabic script. <br>Press Enter to submit your search query.",
  },
  {
    element: "#outlined-search",
    title: "Search",
    intro:
      "We don't have metadata for all texts in Arabic script, so try transcription into Latin characters if you don't find what you're looking for. <br><b>Note that the search bar only searches the metadata, not the content of the texts!</b>",
  },
  {
    element: "#text-reuse-header",
    title: "Text Reuse Data and Visualisations",
    intro:
      `This column gives access to the KITAB <a href="https://kitab-project.org/data#passim-text-reuse-data-sets" target="_blank">text reuse data</a> and <a href="https://kitab-project.org/data/viz" target="_blank">visualizations</a>.`,
    position: "right",
  },
  {
    element: ".tour-reuse-count",
    title: "Text Reuse Statistics",
    intro:
      "This number shows how many text reuse instances were found for this book in the corpus. Click it to open a side panel with pairwise text reuse statistics.",
  },
  {
    element: "#CorpusMetadata-Drawer",
    title: "Metadata details",
    intro:
      "The panel gives more details about the text reuse data for this text version. <br>At the top, you can access tabs with detailed metadata on the author, the text and text version.",
  },
  {
    element: "#text-reuse-drawer-info",
    title: "Info icons",
    intro:
      'Wherever you see one of these info icons, click it to see more information. <br>This one will explain all the features of the text reuse panel.',
    position: "right",
  },
  {
    element: ".tour-corpus-viz",
    title: "Corpus-Wide Visualisation",
    intro:
      `Click this icon to open a visualisation of corpus-wide text reuse for this book — showing all books that share passages with it. <br><a href="https://kitab-project.org/data/viz#scatter-viz" target="_blank"><img src="${oneToAllScreenshot}" style="max-width:100%"/></a><br>Click the image to learn more about the visualization.`,
  },
  
  {
    element: ".tour-row-checkbox",
    title: "Select Texts for Pairwise Comparison",
    intro:
      "Check two rows to select them in order to view the pairwise text reuse data or download the metadata for the selected texts.",
    position: "right",
  },
  {
    element: "#results-and-selection",
    title: "Select Texts for Pairwise Comparison",
    intro:
      "When two rows rows are selected, buttons will appear above the table. <br>Click the <b>barcode</b> icon to see a pairwise visualization of their text reuse, <br>the <b>file</b> icon to download their text reuse data, <br>or the <b>table</b> icon to download their metadata.",
    position: "right",
  },
  {
    element: "#filter-sidebar-toggle",
    title: "Filter Sidebar",
    intro:
      "This icon opens the filter sidebar. Click <b>Next</b> to see it.",
    position: "bottom",
  },
  {
    // opened dynamically via onBeforeChange; always included regardless of DOM state
    element: "#filter-sidebar",
    title: "Filter Sidebar",
    intro:
      "Here you can narrow the results to texts in specific languages, exclude uncorrected OCR, filter by annotation status, token count, and more. <br>Click the <b>info</b> icon for more details.",
    position: "right",
  },
  /*{
    element: "#filter-options-info",
    title: "Info icons",
    intro:
      'Wherever you see one of these info icons , click it to see more information. This one will explain all the filters.',
    position: "right",
  },*/
  
  {
    element: ".tour-download-text",
    title: "Download a Text",
    intro:
      "Click the cloud icon to download the plain-text version of a book directly from the OpenITI GitHub repository.",
  },
  {
    element: ".tour-version-link",
    title: "Clickable Cells",
    intro:
      "You can click the VersionID to open a side panel with detailed metadata for that text version.",
  },
  /*{
    element: "#CorpusMetadata-Drawer",
    title: "Metadata details",
    intro:
      "The panel contains metadata on this specific text version. At the top, you can access tabs with metadata on the author, the text and text reuse.",
  },*/
  {
    element: ".tour-book-link",
    title: "Clickable Cells",
    intro:
      "The book title and author name are also clickable and open related information.",
  },
  {
    element: "#version-dropdown",
    title: "Select Your OpenITI release version",
    intro:
      `The OpenITI corpus changes all the time. We periodically <a href="https://doi.org/10.5281/zenodo.3082463" target="_blank">release stable versions</a> that can be cited. Select the OpenITI version here.`,
  },
  
  {
    element: "#take-a-tour-btn",
    title: "That's it!",
    intro:
      "You can revisit this tour at any time by clicking this button.",
    position: "bottom",
  },
];

const DYNAMIC_ELEMENTS = new Set(["#filter-sidebar", "#CorpusMetadata-Drawer", "#text-reuse-drawer-info"]);

const CorpusMetadataTour = ({ run, onExit, setFilterPanel, toggleSidePanel, setIsOpenDrawer }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    // Filter out steps whose target element does not exist in the DOM,
    // so the tour degrades gracefully (e.g. when corpus-viz icon is absent).
    const availableSteps = steps.filter((step) => {
      if (!step.element) return true;
      if (DYNAMIC_ELEMENTS.has(step.element)) return true;
      return !!document.querySelector(step.element);
    });

    const handleDone = () => {
      // reset the search query:
      if (tourSearchTyped) document.getElementById("search-clear-btn")?.click();
      // uncheck all selected boxes:
      if (tourCheckboxesChecked) document.getElementById("deselect-all")?.click();
      // close the filter panel and metadata drawer:
      setFilterPanel?.(false);
      setIsOpenDrawer?.(false);
      // store value in the cookie so that the tour is not shown next time.
      localStorage.setItem(TOUR_KEY, "true");
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
      });

    // Helper: set a React-controlled input's value programmatically.
    const setInputValue = (selector, value) => {
      const input = document.querySelector(selector);
      if (!input) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      ).set;
      nativeSetter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    // Track whether the tour currently has the sidebar/drawer open.
    let tourSidebarOpen = false;
    let tourDrawerOpen = false;
    let tourSearchTyped = false;
    let tourCheckboxesChecked = false;

    // onBeforeChange: targetElement is the upcoming step's element.
    // Returning a Promise lets React finish rendering before intro.js highlights.
    introRef.current.onBeforeChange(function (targetElement) {
      if (targetElement?.id === "filter-sidebar") {
        console.log("FILTER SIDEBAR TOUR")
        tourSidebarOpen = true;
        setFilterPanel?.(true);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else if (targetElement?.id === "CorpusMetadata-Drawer") {
        console.log("META DRAWER TOUR")
        tourDrawerOpen = true;
        toggleSidePanel(
          {
            version_id: "Shamela0037022",
            release_code: "2025.1.9",
          },
          3
        );
        setIsOpenDrawer?.(true);
        return new Promise((resolve) => {
          setTimeout(() => {
            introRef.current?.refresh();
            resolve();
          }, 350);
        });
      } else if (tourSidebarOpen && targetElement?.id !== "filter-options-info") {
        tourSidebarOpen = false;
        setFilterPanel?.(false);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else if (tourDrawerOpen && targetElement?.id !== "text-reuse-drawer-info") {
        tourDrawerOpen = false;
        setIsOpenDrawer?.(false);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else {
        console.log(targetElement.id);
      }
    });

    // Type a demo query when the first search step appears; check the first two
    // rows when the checkbox step appears. Both are cleaned up in handleDone.
    introRef.current.onAfterChange(function (targetElement) {
      if (targetElement?.id === "outlined-search" && !tourSearchTyped) {
        tourSearchTyped = true;
        setTimeout(() => {
          setInputValue("#outlined-search", "ابن خلدون");
          const form = document.querySelector("#outlined-search")?.closest("form");
          form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }, 400);
      }
      if (targetElement?.id === "outlined-search" && tourSearchTyped) {
        tourSearchTyped = true;
        setTimeout(() => {
          setInputValue("#outlined-search", "Ibn Khaldun");
        }, 400);
      }
      if (targetElement?.classList?.contains("tour-row-checkbox") && !tourCheckboxesChecked) {
        tourCheckboxesChecked = true;
        const checkboxes = document.querySelectorAll(".tour-row-checkbox input[type='checkbox']");
        setTimeout(() => {
          
          if (!checkboxes[0].checked) checkboxes[0].click();
        }, 1800);
        setTimeout(() => {
          
          if (!checkboxes[2].checked) checkboxes[2].click();
        }, 2200);
      }
    });

    introRef.current.onComplete(handleDone).onExit(handleDone);

    introRef.current.start();

    return () => {
      introRef.current?.exit(true);
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export { TOUR_KEY };
export default CorpusMetadataTour;
