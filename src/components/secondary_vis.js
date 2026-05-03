// createHeatmap.js
import * as d3 from 'd3';
import { buildCheckboxPanel, FIELD_GROUPS } from './heatmap/checkboxPanel.js';

// ─── 1. DATA SETUP ────────────────────────────────────────────────────────────

/**
 * Filters the dataset by aircraft class and aggregates per-part strike statistics.
 * Returns a plain object keyed by part ID.
 */
function setupData(data, acClass, parts) {
  const filteredData = data.filter(d => d.AC_CLASS === acClass);

  const sumField = (rows, field) =>
    d3.sum(rows, d => {
      const val = String(d[field]).trim().toUpperCase();
      return val === "TRUE" || val === "1" ? 1 : 0;
    });

  // Collect every stat key from FIELD_GROUPS so the list is defined in one place
  const allStatKeys = FIELD_GROUPS.flatMap(g => g.fields.map(f => f.key));

  const partStats = {};
  parts.forEach(part => {
    const partData = filteredData.filter(d => {
      const val = String(d[part]).trim().toUpperCase();
      return val === "TRUE" || val === "1";
    });

    const stats = {
      strikes: partData.length,
    };

    allStatKeys.forEach(key => {
      stats[key] = sumField(partData, key);
    });

    partStats[part] = stats;
  });

  return partStats;
}

// ─── 2. HEATMAP ───────────────────────────────────────────────────────────────

/**
 * Loads the SVG file, colors each part according to strike intensity,
 * appends the gradient legend, and returns the populated SVG selection.
 */
function renderHeatmap(wrapper, svgPath, parts, partStats, acClass, onPartHover) {
  return d3.xml(svgPath).then(xml => {
    const importedNode = document.importNode(xml.documentElement, true);
    const svg = d3.select(importedNode);

    const originalWidth  = svg.attr("width")  || 800;
    const originalHeight = svg.attr("height") || 800;

    if (!svg.attr("viewBox")) {
      svg.attr("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
    }

    svg.attr("width", null)
       .attr("height", null)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .style("width", "100%")
       .style("height", "100%");

    wrapper.node().appendChild(importedNode);

    const maxStrikes = d3.max(Object.values(partStats), d => d.strikes) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxStrikes])
      .interpolator(d3.interpolateYlOrRd);

    parts.forEach(part => {
      const stats = partStats[part];
      const el = svg.select(`#${part}`);
      if (el.empty()) return;

      el.transition()
        .duration(1000)
        .style("fill", stats.strikes > 0 ? colorScale(stats.strikes) : "#e0e0e0")
        .style("stroke", "#333")
        .style("stroke-width", "1px");

      el.attr("cursor", "pointer")
        .on("mouseover",  (event) => onPartHover.show(event, part, stats))
        .on("mousemove",  (event) => onPartHover.move(event))
        .on("mouseout",   ()      => onPartHover.hide())
        // keep the stroke highlight on the element itself
        .on("mouseover.stroke", function() {
          d3.select(this).style("stroke-width", "3px");
        })
        .on("mouseout.stroke", function() {
          d3.select(this).style("stroke-width", "1px");
        });
    });

    // gradient legend
    const gradientId = `gradient-${acClass}`;
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", gradientId);

    linearGradient.selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => d3.interpolateYlOrRd(d));

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 35)");

    legend.append("rect")
      .attr("width", 150).attr("height", 15)
      .style("fill", `url(#${gradientId})`)
      .style("stroke", "#333");

    legend.append("text").attr("y", 30).style("font-size", "12px").text("0");
    legend.append("text").attr("x", 150).attr("y", 30).attr("text-anchor", "end")
      .style("font-size", "12px").text(`${maxStrikes.toLocaleString()} Strikes`);
    legend.append("text").attr("y", -10).style("font-weight", "bold")
      .text("Strike Intensity");

    return svg;
  });
}

// ─── 3. TOOLTIP ───────────────────────────────────────────────────────────────

/**
 * Creates (or reuses) the floating tooltip element and returns
 * the three interaction handlers expected by renderHeatmap.
 * getActiveKeys is a function returning a Set<string> of visible field keys.
 */
function setupTooltip(getActiveKeys) {
  let tooltip = d3.select("body").select(".heatmap-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "heatmap-tooltip");
  }

  function buildTooltipHTML(part, stats) {
    const activeKeys = getActiveKeys();

    let html = `<div class="tooltip-title">Damage zone: ${part}</div>`;
    html += `Strikes: <strong>${stats.strikes}</strong><br/>`;

    FIELD_GROUPS.forEach(({ group, fields }) => {
      const visibleFields = fields.filter(f => activeKeys.has(f.key));
      if (visibleFields.length === 0) return;

      html += `<div class="tooltip-section-label">${group}</div>`;
      visibleFields.forEach(({ key, label }) => {
        html += `${label}: <strong>${stats[key]}</strong><br/>`;
      });
    });

    return html;
  }

  return {
    show(event, part, stats) {
      tooltip
        .html(buildTooltipHTML(part, stats))
        .style("visibility", "visible")
        .style("top",  (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    },
    move(event) {
      tooltip
        .style("top",  (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    },
    hide() {
      tooltip.style("visibility", "hidden");
    },
  };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * @param {Object} config
 * @param {string} config.containerId - The ID of the tab (e.g., "#Airplane")
 * @param {string} config.svgPath     - Path to the SVG file
 * @param {string} config.acClass     - The AC_CLASS filter (e.g., "A", "H")
 * @param {Array}  config.parts       - Array of SVG element IDs to color
 * @param {Array}  config.data        - The loaded CSV data
 */
export function createHeatmap(config) {
  const { containerId, svgPath, acClass, parts, data } = config;
  const container = d3.select(containerId);
  container.selectAll("*").remove();

  // ── layout shell ──────────────────────────────────────────────────────────
  const layout = container.append("div").attr("class", "heatmap-layout");

  const blueprintWrapper = layout.append("div").attr("class", "blueprint-wrapper");
  const controlsWrapper  = layout.append("div"); // checkbox panel mounts here

  // ── data ──────────────────────────────────────────────────────────────────
  const partStats = setupData(data, acClass, parts);

  // ── checkbox panel ────────────────────────────────────────────────────────
  // getActiveKeys is returned by buildCheckboxPanel; tooltip reads it on each hover
  const getActiveKeys = buildCheckboxPanel(controlsWrapper.node(), () => {
    // onChange: tooltip is rebuilt live on next hover — no extra work needed here.
    // If you want to re-render on change, trigger renderHeatmap again from here.
  });

  // ── tooltip ───────────────────────────────────────────────────────────────
  const tooltipHandlers = setupTooltip(getActiveKeys);

  // ── heatmap ───────────────────────────────────────────────────────────────
  renderHeatmap(blueprintWrapper, svgPath, parts, partStats, acClass, tooltipHandlers);
}