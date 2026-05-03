import { createHeatmap } from "../secondary_vis";
import { initTabs } from "./initTabs";

const heatmapConfigs = {
  "Airplane": {
    svgPath: "/data/images/airplane.svg",
    acClass: "A",
    parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"]
  },
  "Helicopter": {
    svgPath: "/data/images/helicopter.svg",
    acClass: "B",
    parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
  },
  "Glider": {
    svgPath: "/data/images/glider.svg",
    acClass: "C",
    parts: ["STR_RAD", "STR_WINDSHLD", "STR_FUSE", "STR_TAIL"]
  },
  "Balloon": {
    svgPath: "/data/images/balloon.svg",
    acClass: "D",
    parts: ["STR_FUSE", "STR_LG"]
  },
  // Missing Dirigible
  "Gyroplane": {
    svgPath: "/data/images/gyroplane.svg",
    acClass: "F",
    parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
  },
  "Ultralight": {
    svgPath: "/data/images/ultralight.svg",
    acClass: "G",
    parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
  }
};

// Track which heatmaps have already been initialized to avoid redundant re-renders
const initializedHeatmaps = new Set();

export function init_heatmaps(data) {
    initTabs(); // Ensure tabs are initialized before setting up heatmaps

    // Helper to render a specific tab's heatmap
    function renderHeatmapForTab(tabId) {
      const config = heatmapConfigs[tabId];

      // Only proceed if we have a config for this tab and it hasn't been loaded yet
      if (config && !initializedHeatmaps.has(tabId)) {
        createHeatmap({
          containerId: `#${tabId}`,
          svgPath: config.svgPath,
          acClass: config.acClass,
          parts: config.parts,
          data: data
        });
        
        // Mark as initialized
        initializedHeatmaps.add(tabId);
        console.log(`Heatmap initialized for: ${tabId}`);
      }
    }

    // Add Event Listeners to radio buttons
    const radioInputs = document.querySelectorAll('input[name="aircraft-tab"]');
    
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const targetTabId = e.target.getAttribute('data-target');
        renderHeatmapForTab(targetTabId);
      });
    });

    // Initial Check: Render the tab that is checked by default on page load
    const checkedRadio = document.querySelector('input[name="aircraft-tab"]:checked');
    if (checkedRadio) {
      renderHeatmapForTab(checkedRadio.getAttribute('data-target'));
    }

}