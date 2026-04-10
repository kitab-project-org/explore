import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";


const steps = [
  {
    element: "#filter-sidebar",
    title: "Filter Sidebar",
    intro:
      "This tour explains the filter options available in the sidebar.",
    position: "right",
  },
  {
    element: "#filter-section-versions",
    title: "Display Text Versions",
    intro:
      "The OpenITI corpus often contains multiple digital versions of each text. <br>One of these is selected to be the <b>primary</b> version; any other version is labelled as <b>secondary</b>. We focus our efforts on primary versions only. <br>Use the primary version unless you have a specific reason to use another!",
    position: "right",
  },
  {
    element: "#filter-section-text-type",
    title: "Texts by Type",
    intro:
      "Here you can decide to exclude <b>uncorrected OCR texts</b> from the results, or focus only on transcriptions of handwritten documents (<b>manuscripts</b>). <br><b>Other</b> texts are texts that are neither uncorrected OCR nor manuscripts.",
    position: "right",
  },
  {
    element: "#filter-section-languages",
    title: "Languages",
    intro:
      "Use the language toggles to limit your search results to one or more specific languages.",
    position: "right",
  },
  {
    element: "#filter-section-annotation",
    title: "Annotation Status",
    intro:
      "OpenITI texts are annotated by human annotators, who compare the text with the original source and add structural annotation (chapters, sections, …). Use these toggles to filter by annotation status:<ul style='margin-top:6px;padding-left:18px'><li><b>Pending:</b> not yet annotated</li><li><b>In Progress:</b> currently being annotated</li><li><b>Completed:</b> annotated by one annotator</li><li><b>Completed and Vetted:</b> annotation checked by a second annotator</li></ul>",
    position: "right",
  },
  {
    element: "#filter-clear-btn",
    title: "Clear Filters",
    intro:
      "Once you have applied one or more filters, a <b>Clear filters</b> icon appears here. Click it to reset all active filters at once.",
    position: "bottom",
  },
];

const FilterSidebarTour = ({ run, onExit }) => {
  const introRef = useRef(null);

  useEffect(() => {
    if (!run) return;

    const availableSteps = steps.filter((step) => {
      if (!step.element) return true;
      return !!document.querySelector(step.element);
    });

    const handleDone = () => {
      onExit?.();
    };

    introRef.current = introJs.tour()
      .setOptions({
        steps: availableSteps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        scrollToElement: false,
        disableInteraction: false,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Done",
      })
      .onComplete(handleDone)
      .onExit(handleDone);

    // scrollToElement:true only scrolls the window. The sidebar has its own
    // internal scroll container, so we scroll the target element into view
    // ourselves before each step (scrollIntoView walks up to the nearest
    // scrollable ancestor, which is the sidebar).
    introRef.current.onBeforeChange(function (targetElement) {
      if (!targetElement) return;
      const sidebar = document.getElementById("filter-sidebar");
      if (!sidebar) return;
      // Annotation section is at the very bottom — scroll sidebar to bottom.
      // All other sections are near the top — reset to top so the Filters
      // header stays visible and nothing overlaps.
      if (targetElement.id === "filter-section-annotation") {
        sidebar.scrollTop = sidebar.scrollHeight;
      } else {
        sidebar.scrollTop = 0;
      }
      // The annotation tooltip can push the page down. Scroll the page back to
      // the top for the clear-filters step so the sidebar header is in view.
      if (targetElement.id === "filter-clear-btn") {
        window.scrollTo(0, 0);
      }
      const delay = targetElement.id === "filter-clear-btn" ? 200 : 50;
      return new Promise((resolve) => setTimeout(resolve, delay));
    });

    // After each step is rendered: refresh the highlight to pick up the
    // element's actual post-scroll position (covers both Next and Back),
    // and — on the languages step — activate the "ara" toggle after a short
    // delay so the user sees it switch on while the section is highlighted.
    introRef.current.onAfterChange(function (targetElement) {
      setTimeout(() => introRef.current?.refresh(), 100);
      if (targetElement?.id === "filter-section-languages") {
        setTimeout(() => {
          const araInput = document.querySelector("#filter-lang-ara input");
          if (araInput && !araInput.checked) {
            araInput.click();
          }
        }, 600);
      }
    });

    introRef.current.start();

    // The filter sidebar is position:sticky, so its visual position shifts
    // when the page scrolls. Refresh the highlight on every scroll event.
    const handleScroll = () => introRef.current?.refresh();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      introRef.current?.exit(true);
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default FilterSidebarTour;
