import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = "UA-184803711-1";

export default function Analytics() {
  const location = useLocation();

  // --------------------------
  // Helpers
  // --------------------------
  function getCookie(name) {
    const match = document.cookie.match(
      "(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)"
    );
    return match ? match.pop() : "";
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };
  }

  function enableAnalytics() {
    ensureGtag();

    // IMPORTANT: undo hard-disable (set by disableAnalytics)
    window[`ga-disable-${GA_ID}`] = false;

    // First-time init only
    if (!window.__gaLoaded) {
      window.gtag("js", new Date());
      window.__gaLoaded = true;
    }

    // Always (re)apply config so re-enable works without refresh
    window.gtag("config", GA_ID);

    window.__gaEnabled = true;
    console.log("Analytics enabled");
  }

  function disableAnalytics() {
    // Immediately prevents GA from sending hits
    window[`ga-disable-${GA_ID}`] = true;

    window.__gaEnabled = false;
    console.log("Analytics disabled");
  }

  // --------------------------
  // 1️⃣ Initialisation + Consent
  // --------------------------
  useEffect(() => {
    // Prevent double execution in dev StrictMode
    if (window.__analyticsInitialized) return;
    window.__analyticsInitialized = true;

    function init() {
      if (!window.cookieconsent) {
        console.warn("cookieconsent not loaded");
        return;
      }

      const consent = getCookie("cookieconsent_status");

      // Start analytics if user consented or did not deny
      if (consent === "allow" || consent === "") {
        enableAnalytics();
      } else {
        disableAnalytics();
      }

      window.cookieconsent.initialise({
        palette: {
          popup: { background: "#efefef", text: "#404040" },
          button: { background: "#2862a5", text: "#ffffff" },
        },
        type: "opt-out",
        content: {
          allow: "Approve",
          dismiss: "Approve",
          deny: "Reject",
        },
        onStatusChange: function () {
          if (this.hasConsented()) enableAnalytics();
          else disableAnalytics();
        },
        // Helps with the little “corner widget” revoke/restore interactions
        onRevokeChoice: function () {
          if (this.hasConsented()) enableAnalytics();
          else disableAnalytics();
        },
      });
    }

    if (document.readyState === "complete") init();
    else window.addEventListener("load", init);

    return () => window.removeEventListener("load", init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------
  // 2️⃣ Track Route Changes (SPA pageviews)
  // --------------------------
  useEffect(() => {
    if (!window.__gaEnabled) return;

    window.gtag("config", GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}
