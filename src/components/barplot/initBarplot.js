import * as d3 from "d3";

const margin = {top: 50, right: 90, bottom: 70, left: 75};

function getContainerWidth() {
    const element = document.getElementById("tertiary-vis");
    return element ? element.clientWidth || element.getBoundingClientRect().width || 600 : 600;
}

let totalWidth = getContainerWidth();
let width = totalWidth - margin.left - margin.right;

let height = Math.min(600, Math.max(350, Math.round(width * 0.8))) - margin.top - margin.bottom;

const controlsContainer = d3.select("#tertiary-controls")
    .append("div")
    .attr("class", "barplot-controls")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("gap", "12px")
    .style("align-items", "center")
    .style("margin-bottom", "8px")
    .style("padding", "6px 0");

controlsContainer.append("label")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("color", "#444")
    .text("X-axis:");

const xSelect = controlsContainer.append("select")
    .attr("id", "xAxisSelect")
    .style("padding", "4px 8px")
    .style("border-radius", "4px")
    .style("border", "1px solid #ccc")
    .style("font-size", "13px")
    .style("cursor", "pointer");

const xAxisOptions = [
    {value: "year", label: "Year"},
    {value: "month", label: "Month"},
    {value: "day", label: "Day"},
    {value: "timeOfDay", label: "Time of Day"},
    {value: "phaseOfFlight", label: "Phase of Flight"},
];

xAxisOptions.forEach(option => {
    xSelect.append("option").attr("value", option.value).text(option.label);
});

controlsContainer.append("label")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("color", "#444")
    .style("margin-left", "12px")
    .text("Y-axis:");

const ySelect = controlsContainer.append("select")
    .attr("id", "yAxisSelect")
    .style("padding", "4px 8px")
    .style("border-radius", "4px")
    .style("border", "1px solid #ccc")
    .style("font-size", "13px")
    .style("cursor", "pointer");

const yAxisOptions = [
    {value: "count", label: "Strike Count"},
    {value: "damage", label: "Damage Cost ($)"},
];

yAxisOptions.forEach(option => {
    ySelect.append('option').attr('value', option.value).text(option.label);
});

const toggleWrapper = controlsContainer.append("div")
    .style("display", "flex")
    .style("gap", "14px")
    .style("margin-left", "12px")
    .style("align-items", "center");

function makeToggle(id, label, color, defaultChecked = true) {
    const wrap = toggleWrapper.append("label")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "5px")
        .style("font-size", "13px")
        .style("cursor", "pointer")
        .style("color", color);

    wrap.append("input")
        .attr("type", "checkbox")
        .attr("id", id)
        .property("checked", defaultChecked)
        .style("accent-color", color)
        .style("cursor", "pointer");

    wrap.append("span").text(label);
}

makeToggle("showMean", "Mean", "#e74c3c");
makeToggle("showMedian", "Median", "#2980b9");

controlsContainer.append("button")
    .attr("id", "exportBarplot")
    .style("margin-left", "auto")
    .style("padding", "4px 12px")
    .style("border-radius", "4px")
    .style("border", "1px solid #888")
    .style("background", "#f5f5f5")
    .style("font-size", "13px")
    .style("cursor", "pointer")
    .style("font-weight", "600")
    .text("Export PNG")
    .on("click", exportPlot);

const svgEl = d3.select("#tertiary-vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const svg = svgEl.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");

const xLabel = svg.append("text")
    .attr("class", "axis-label x-label")
    .attr("x", width / 2)
    .attr("y", height + 55)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#555");

const yLabel = svg.append("text")
    .attr("class", "axis-label y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -58)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#555");

const chartTitle = svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333");

const drillSubtitle = svg.append("text")
    .attr("class", "drill-subtitle")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "#e67e22")
    .style("font-style", "italic");

const meanGroup = svg.append("g").attr("class", "mean-group");
const medianGroup = svg.append("g").attr("class", "median-group");

const x = d3.scaleBand().range([0, width]).padding(0.2);
const y = d3.scaleLinear().range([height, 0]);

let currentData = [];
let xAxisKey = "year";
let yAxisKey = "count";

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const PHASE_ORDER = [
    "Approach", "Landing Roll", "Climb", "En Route",
    "Descent", "Take-off run", "Taxi", "Parked", "Unknown"
];

function getXKeyLabel(d, xKey) {
    switch (xKey) {
        case "year":
            return {key: +d["INCIDENT_YEAR"], label: String(+d["INCIDENT_YEAR"])};

        case "month": {
            const m = +d["INCIDENT_MONTH"];
            if (!m || m < 1 || m > 12) return null;
            return {key: m, label: MONTH_NAMES[m - 1]};
        }

        case "day": {
            const raw = d["INCIDENT_DATE"] || "";
            let day =+ raw.split("/")[1];

            if (!day || isNaN(day)) return null;
            return {key: day, label: String(day)};
        }

        case "timeOfDay": {
            const raw = (d["TIME_OF_DAY"] || "").trim();
            if (raw) return {key: raw, label: raw};
            const hour = +d["TIME"];

            if (isNaN(hour)) return null;
            const h = Math.floor(hour / 100);
            if (h >= 4 && h < 9) return {key: "Dawn", label: "Dawn"};
            if (h >= 9 && h < 17) return {key: "Day", label: "Day"};
            if (h >= 17 && h < 20) return {key: "Dawn", label: "Dawn"};
            return {key: "Night", label: "Night"};
        }

        case "phaseOfFlight": {
            const phase = (d["PHASE_OF_FLIGHT"] || "Unknown").trim() || "Unknown";
            return {key: phase, label: phase};
        }

        default:
            return null;
    }
}

function getYValue(rows, yKey) {
    if (yKey === "count") return rows.length;
    return d3.sum(rows, r => (+r["COST_OTHER_INFL_ADJ"] || 0));
}

function sortAggregated(aggregated, xKey) {
    switch (xKey) {
        case "year":
        case "month":
        case "day":
            return aggregated.slice().sort((a, b) => a.key - b.key);

        case "timeOfDay": {
            const order = ["Dawn", "Day", "Dusk", "Night"];
            return aggregated.slice().sort(
                (a, b) => (order.indexOf(a.key) + 1 || 99) - (order.indexOf(b.key) + 1 || 99)
            );
        }

        case "phaseOfFlight":
            return aggregated.slice().sort(
                (a, b) => (PHASE_ORDER.indexOf(a.key) + 1 || 99) - (PHASE_ORDER.indexOf(b.key) + 1 || 99)
            );

        default:
            return aggregated;
    }
}

function tickValues(domain, xKey) {
    const n = domain.length;
    if (n <= 15) return domain;
    if (xKey === "year") {
        // show every 5th year
        return domain.filter(d => d % 5 === 0);
    }
    const step = Math.ceil(n / 12);
    return domain.filter((_, i) => i % step === 0);
}

const LABEL_H = 10;

function drawRefLine(group, yVal, color, dash, rawLabel) {
    group.selectAll("*").remove();

    group.append("line")
        .attr("x1", 0).attr("x2", width)
        .attr("y1", y(yVal)).attr("y2", y(yVal))
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", dash)
        .attr("opacity", 0)
        .transition().duration(600)
        .attr("opacity", 0.85);

    const labelText = rawLabel;
    const approxW = labelText.length * 6 + 4;
    group.append("rect")
        .attr("x", width + 3)
        .attr("y", y(yVal) - LABEL_H + 3)
        .attr("width", approxW)
        .attr("height", LABEL_H)
        .attr("fill", "white")
        .attr("opacity", 0.85);

    group.append("text")
        .attr("x", width + 5)
        .attr("y", y(yVal) + 3)
        .text(labelText)
        .style("font-size", "10px")
        .style("font-weight", "600")
        .style("fill", color);
}

function drawRefLines(aggregated) {
    const showMean = document.getElementById("showMean")?.checked ?? true;
    const showMedian = document.getElementById("showMedian")?.checked ?? true;
    const values = aggregated.map(d => d.value);

    meanGroup.selectAll("*").remove();
    medianGroup.selectAll("*").remove();

    if (!values.length) return;

    const mean = d3.mean(values);
    const median = d3.median(values);

    const bothShown = showMean && showMedian;
    const yMean = y(mean);
    const yMedian = y(median);
    const tooClose = bothShown && Math.abs(yMean - yMedian) < LABEL_H;

    if (showMean) {
        drawRefLine(meanGroup, mean, "#e74c3c", "6,3", `μ ${formatNumber(mean, yAxisKey)}`);
    }
    if (showMedian) {
        drawRefLine(medianGroup, median, "#2980b9", "4,4", `M ${formatNumber(median, yAxisKey)}`);
        if (tooClose) {
            const direction = yMedian > yMean ? 1 : -1;
            medianGroup.selectAll("rect, text")
                .attr("transform", `translate(0, ${direction * LABEL_H})`);
        }
    }
}

function formatNumber(v, yKey) {
    if (yKey === "damage") return `$${d3.format(",.0f")(v)}`;
    return d3.format(",.0f")(v);
}

function resolveDrillDown(data, requestedKey) {
    const distinct = new Set(
        data.map(d => {
            const kl = getXKeyLabel(d, requestedKey);
            return kl ? kl.key : null;
        }).filter(k => k !== null)
    );

    if (distinct.size === 0 || distinct.size > 1) {
        return {effectiveKey: requestedKey, drillLabel: ""};
    }

    const cascade = {
        year: {next: "month", note: (v) => `Showing months for ${v}`},
        month: {next: "day", note: (v) => `Showing days for ${MONTH_NAMES[v - 1] ?? v}`},
        day: {next: "timeOfDay", note: (v) => `Showing times of day for day ${v}`},
    };

    const entry = cascade[requestedKey];
    if (!entry) {
        return {effectiveKey: requestedKey, drillLabel: ""};
    }

    const nextDistinct = new Set(
        data.map(d => {
            const kl = getXKeyLabel(d, entry.next);
            return kl ? kl.key : null;
        }).filter(k => k !== null)
    );

    if (nextDistinct.size === 0) {
        console.warn(
            `[barplot] drill-down to "${entry.next}" yielded no data.`,
            data[0] ? Object.keys(data[0]) : "no data"
        );
        return {effectiveKey: requestedKey, drillLabel: ""};
    }

    const singleValue = [...distinct][0];
    return {
        effectiveKey: entry.next,
        drillLabel: entry.note(singleValue),
    };
}

function update(data) {
    const {effectiveKey, drillLabel} = resolveDrillDown(data, xAxisKey);

    const groups = d3.rollups(
        data,
        rows => getYValue(rows, yAxisKey),
        d => {
            const kl = getXKeyLabel(d, effectiveKey);
            return kl ? kl.key : null;
        }
    ).filter(([k]) => k !== null);

    let aggregated = groups.map(([key, value]) => {
        const sample = data.find(d => {
            const kl = getXKeyLabel(d, effectiveKey);
            return kl && kl.key === key;
        });
        const label = sample ? getXKeyLabel(sample, effectiveKey).label : String(key);
        return {key, label, value};
    });

    aggregated = sortAggregated(aggregated, effectiveKey);

    x.domain(aggregated.map(d => d.key));
    y.domain([0, d3.max(aggregated, d => d.value) || 1]).nice();

    const tickVals = tickValues(x.domain(), effectiveKey);
    const labelMap = Object.fromEntries(aggregated.map(d => [d.key, d.label]));

    xAxisGroup
        .transition().duration(500)
        .call(
            d3.axisBottom(x)
                .tickValues(tickVals)
                .tickFormat(k => labelMap[k] ?? k)
        );

    const rotateTicks = aggregated.length > 8 || effectiveKey === "phaseOfFlight";
    xAxisGroup.selectAll("text")
        .style("text-anchor", rotateTicks ? "end" : "middle")
        .attr("dx", rotateTicks ? "-0.6em" : "0")
        .attr("dy", rotateTicks ? "-0.1em" : "0.9em")
        .attr("transform", rotateTicks ? "rotate(-40)" : "rotate(0)");

    yAxisGroup
        .transition().duration(500)
        .call(
            d3.axisLeft(y)
                .ticks(6)
                .tickFormat(v => yAxisKey === "damage" ? `$${d3.format("~s")(v)}` : d3.format("~s")(v))
        );

    const effectiveOption = xAxisOptions.find(o => o.value === effectiveKey);
    const requestedOption = xAxisOptions.find(o => o.value === xAxisKey);
    const xLabelText = effectiveOption?.label ?? effectiveKey;
    const yLabelText = yAxisKey === "count" ? "Number of Strikes" : "Damage Cost ($)";
    xLabel.text(xLabelText);
    yLabel.text(yLabelText);
    chartTitle.text(`${yLabelText} by ${requestedOption?.label ?? xAxisKey}`);
    drillSubtitle.text(drillLabel);

    const FILL = "#4a90d9";
    const FILL_H = "#2c5f8a";

    const bars = svg.selectAll(".bar").data(aggregated, d => d.key);

    bars.exit()
        .transition().duration(300)
        .attr("y", height)
        .attr("height", 0)
        .attr("opacity", 0)
        .remove();

    const barsEnter = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", FILL)
        .attr("rx", 2);

    barsEnter.merge(bars)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", FILL_H);
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.label}</strong><br/>${yLabelText}: <b>${formatNumber(d.value, yAxisKey)}</b>`);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.offsetX + 14) + "px")
                .style("top", (event.offsetY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", FILL);
            tooltip.style("opacity", 0);
        })
        .transition().duration(600).ease(d3.easeCubicOut)
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", FILL)
        .attr("rx", 2);

    drawRefLines(aggregated);
}

const tooltip = d3.select("#tertiary-vis")
    .append("div")
    .attr("class", "bar-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255,255,255,0.95)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("padding", "7px 11px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
    .style("opacity", 0)
    .style("transition", "opacity 0.15s");

d3.select("#tertiary-vis").style("position", "relative");

function buildFilterSummary() {
    const parts = [];

    const yearVal = document.querySelector('.slider-block .slider-values');
    if (yearVal) parts.push(`Year: ${yearVal.textContent.trim()}`);

    const mStart = document.querySelector('.month-center-label');
    const mEnd = document.querySelectorAll('.month-center-label')[1];
    if (mStart && mEnd) parts.push(`Month: ${mStart.textContent}–${mEnd.textContent}`);

    document.querySelectorAll('.chip-block').forEach(block => {
        const label = block.querySelector('.slider-label')?.textContent?.trim();
        const active = block.querySelector('.chip.active:not(.chip-all)');
        if (label && active) parts.push(`${label}: ${active.textContent.trim()}`);
    });

    return parts.join('  |  ');
}

function exportPlot() {
    const svgNode = d3.select("#tertiary-vis svg").node();
    if (!svgNode) return;

    const clone = svgNode.cloneNode(true);

    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
    text { font-family: sans-serif; }
    .bar { fill: #4a90d9; }
  `;
    clone.insertBefore(style, clone.firstChild);

    const summary = buildFilterSummary();
    if (summary) {
        const svgH = +svgNode.getAttribute("height");
        const svgW = +svgNode.getAttribute("width");
        const padding = 18;
        clone.setAttribute("height", svgH + padding + 4);

        const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bg.setAttribute("x", 0);
        bg.setAttribute("y", svgH);
        bg.setAttribute("width", svgW);
        bg.setAttribute("height", padding + 4);
        bg.setAttribute("fill", "#f9f9f9");
        clone.appendChild(bg);

        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", svgW / 2);
        txt.setAttribute("y", svgH + padding - 2);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("font-size", "9");
        txt.setAttribute("fill", "#555");
        txt.setAttribute("font-family", "sans-serif");
        txt.textContent = `Filters — ${summary}`;
        clone.appendChild(txt);
    }

    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 2;
        canvas.width = clone.getAttribute("width") * scale;
        canvas.height = clone.getAttribute("height") * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = `bird-strikes-${Date.now()}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
    };
    img.src = url;
}

function bindControls() {
    xSelect.on("change", function () {
        xAxisKey = this.value;
        update(currentData);
    });

    ySelect.on("change", function () {
        yAxisKey = this.value;
        update(currentData);
    });

    ["showMean", "showMedian"].forEach(id => {
        document.getElementById(id)?.addEventListener("change", () => {
            update(currentData);
        });
    });
}

function onResize() {
    const newTotal = getContainerWidth();
    if (Math.abs(newTotal - totalWidth) < 10) return;

    totalWidth = newTotal;
    width = totalWidth - margin.left - margin.right;
    height = Math.min(600, Math.max(350, Math.round(width * 0.8))) - margin.top - margin.bottom;

    svgEl
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    x.range([0, width]);
    y.range([height, 0]);

    xAxisGroup.attr("transform", `translate(0,${height})`);
    xLabel.attr("x", width / 2).attr("y", height + 55);
    yLabel.attr("x", -height / 2);
    chartTitle.attr("x", width / 2);
    drillSubtitle.attr("x", width / 2);

    if (currentData.length) update(currentData);
}

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 150);
});

export function init_barplot(data) {
    currentData = data;
    bindControls();
    update(currentData);

    return {
        update(filteredData) {
            currentData = filteredData;
            update(currentData);
        }
    };
}