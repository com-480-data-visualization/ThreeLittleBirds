import * as d3 from 'd3';

/**
 * @param {Object} config 
 * @param {string} config.containerId - The ID of the tab (e.g., "#Airplane")
 * @param {string} config.svgPath    - Path to the SVG file
 * @param {string} config.acClass    - The AC_CLASS filter (e.g., "A", "H")
 * @param {Array}  config.parts      - Array of SVG element IDs to color
 * @param {Array}  config.data       - The loaded CSV data
 */
export function createHeatmap(config) {
    const { containerId, svgPath, acClass, parts, data } = config;
    const container = d3.select(containerId);
    
    // Clear existing content to prevent duplicates if re-rendered
    container.selectAll("*").remove();

    // Load the specific SVG for this tab
    d3.xml(svgPath).then(xml => {
        const importedNode = document.importNode(xml.documentElement, true);
        
        // Wrap SVG in a div
        const wrapper = container.append("div").attr("class", "blueprint-wrapper");
        wrapper.node().appendChild(importedNode);

        // Select the SVG (Assuming the <svg> inside the file has a class or we select the first one)
        const svg = wrapper.select("svg");

        // --- DATA PROCESSING ---
        const filteredData = data.filter(d => d.AC_CLASS === acClass);

        let strikeCounts = {};
        parts.forEach(part => {
            strikeCounts[part] = d3.sum(filteredData, d => {
                const val = String(d[part]).trim().toUpperCase();
                return (val === "TRUE" || val === "1") ? 1 : 0;
            });
        });

        const maxStrikes = d3.max(Object.values(strikeCounts)) || 1;
        const colorScale = d3.scaleSequential()
            .domain([0, maxStrikes])
            .interpolator(d3.interpolateYlOrRd);

        // --- APPLY COLORS ---
        parts.forEach(part => {
            const count = strikeCounts[part];
            const partElement = svg.select(`#${part}`);

            if (partElement.empty()) return;
            
            partElement.transition()
                .duration(1000)
                .style("fill", count > 0 ? colorScale(count) : "#e0e0e0")
                .style("stroke", "#333")
                .style("stroke-width", "1px");

            partElement.attr("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).style("stroke-width", "3px");
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-width", "1px");
                });
        });

        // --- LEGEND (Unique per tab) ---
        const gradientId = `gradient-${acClass}`; // Unique ID per aircraft class
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient").attr("id", gradientId);

        linearGradient.selectAll("stop")
            .data(d3.range(0, 1.1, 0.1))
            .enter().append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => d3.interpolateYlOrRd(d));

        const legendGroup = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(20, 35)`);

        legendGroup.append("rect")
            .attr("width", 150)
            .attr("height", 15)
            .style("fill", `url(#${gradientId})`)
            .style("stroke", "#333");

        legendGroup.append("text").attr("y", 30).style("font-size", "12px").text("0");
        legendGroup.append("text").attr("x", 150).attr("y", 30).attr("text-anchor", "end").style("font-size", "12px")
            .text(`${maxStrikes.toLocaleString()} Strikes`);

        legendGroup.append("text").attr("y", -10).style("font-weight", "bold").text("Strike Intensity");

    });
}