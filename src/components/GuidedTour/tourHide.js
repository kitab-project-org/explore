// Hide the intro.js overlay, highlight and popup (e.g. while a tour is being restarted
// at a step whose target the tour has just created), so that they do not jump around.
const STYLE_ID = "kitab-tour-hide";

export const hideTour = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent =
    ".introjs-overlay, .introjs-helperLayer, .introjs-tooltipReferenceLayer, .introjs-tooltip, .introjs-fixedTooltip { visibility: hidden !important; transition: none !important; }";
  document.head.appendChild(style);
};

export const showTour = () => {
  document.getElementById(STYLE_ID)?.remove();
};
