import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";

const TOUR_KEY = "kitab-corpus-tour-seen";

const steps = [
  {
    title: "Welcome to the KITAB explore platform",
    intro:
      "The portal gives you access to the OpenITI corpus metadata and to the KITAB text reuse data and visualizations. This short tour introduces the main features of the platform. ",
  },
  {
    element: "#outlined-search",
    title: "Search",
    intro:
      "You can find OpenITI texts by searching their metadata, in Latin or Arabic script.",
  },
  {
    element: "#outlined-search",
    title: "Search",
    intro:
      "(we don't have metadata for all texts in Arabic script, so try transcription if you don't find what you're looking for)",
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
      "Here you can narrow the results to texts in specific languages, exclude uncorrected OCR, filter by annotation status, token count, and more.",
    position: "right",
  },
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
      "You can click the VersionID to open a side panel with detailed metadata for that text version. Click 'Next' to see what it looks like.",
  },
  {
    element: "#meta-drawer",
    title: "Metadata details",
    intro:
      "The panel contains metadata on this specific text version. At the top, you can access tabs with metadata on the author, the text and text reuse.",
  },
  {
    element: ".tour-book-link",
    title: "Clickable Cells",
    intro:
      "The book title and author name are also clickable and open related information.",
  },
  {
    element: ".tour-reuse-count",
    title: "Text Reuse Statistics",
    intro:
      "This number shows how many text reuse instances were found for this book in the corpus. Click it to open a side panel with pairwise text reuse statistics.",
  },
  {
    element: ".tour-corpus-viz",
    title: "Corpus-Wide Visualisation",
    intro:
      "Click this icon to open a visualisation of corpus-wide text reuse for this book — showing all books that share passages with it.",
  },
  {
    element: ".tour-row-checkbox",
    title: "Select Texts for Pairwise Comparison",
    intro:
      "Check two rows to select them, then use the panel that appears at the bottom of the page to view their pairwise text reuse data or download the metadata for the selected texts.",
  },
  {
    element: "#version-dropdown",
    title: "Select Your OpenITI release version",
    intro:
      "The OpenITI corpus changes all the time. We periodically release stable versions that can be cited. Select the OpenITI version here.",
  },
  
  {
    element: "#take-a-tour-btn",
    title: "That's it!",
    intro:
      "You can revisit this tour at any time by clicking this button.",
    position: "bottom",
  },
];

const DYNAMIC_ELEMENTS = new Set(["#filter-sidebar", "#meta-drawer"]);

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
      setFilterPanel?.(false);
      setIsOpenDrawer?.(false);
      localStorage.setItem(TOUR_KEY, "true");
      onExit?.();
    };

    introRef.current = introJs.tour()
      .setOptions({
        steps: availableSteps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        scrollToElement: true,
        disableInteraction: false,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Done",
      });

    // Track whether the tour currently has the sidebar/drawer open.
    let tourSidebarOpen = false;
    let tourDrawerOpen = false;

    // onBeforeChange: targetElement is the upcoming step's element.
    // Returning a Promise lets React finish rendering before intro.js highlights.
    introRef.current.onBeforeChange(function (targetElement) {
      if (targetElement?.id === "filter-sidebar") {
        console.log("FILTER SIDEBAR TOUR")
        tourSidebarOpen = true;
        setFilterPanel?.(true);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else if (targetElement?.id === "meta-drawer") {
        console.log("META DRAWER TOUR")
        tourDrawerOpen = true;
        toggleSidePanel(
          {
            version_id: "JK007501",
            release_code: "2025.1.9",
          },
          2
        );
        setIsOpenDrawer?.(true);
        return new Promise((resolve) => {
          setTimeout(() => {
            introRef.current?.refresh();
            resolve();
          }, 350);
        });
      } else if (tourSidebarOpen) {
        tourSidebarOpen = false;
        setFilterPanel?.(false);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else if (tourDrawerOpen) {
        tourDrawerOpen = false;
        setIsOpenDrawer?.(false);
        return new Promise((resolve) => setTimeout(resolve, 350));
      } else {
        console.log(targetElement.id);
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
