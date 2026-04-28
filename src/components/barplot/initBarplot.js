import * as d3 from "d3";

const margin = { top: 30, right: 20, bottom: 50, left: 60 };
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const svg = d3.select("#tertiary-vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
const x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
const y = d3.scaleLinear()
    .range([height, 0]);
const xAxisGroup = svg.append("g")
    .attr("transform", `translate(0, ${height})`);
const yAxisGroup = svg.append("g");

export function init_barplots(data) {
    data.forEach(d => {
        d.year = +d["INCIDENT_YEAR"];
    });

    update(data);
}

function update(data) {
    const aggregated = d3.rollups(
        data,
        v => v.length,
        d => d.year
    ).map(([key, value]) => ({ year: key, count: value }));
    aggregated.sort((a, b) => a.year - b.year);
    x.domain(aggregated.map(d => d.year));
    y.domain([0, d3.max(aggregated, d => d.count)]);
    xAxisGroup.call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));
    yAxisGroup.call(d3.axisLeft(y));
    const bars = svg.selectAll(".bar")
        .data(aggregated, d => d.year);
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .merge(bars)
        .transition()
        .duration(500)
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));
    bars.exit().remove();
}
