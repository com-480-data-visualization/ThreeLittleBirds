import * as d3 from 'd3';

(function () {
    'use strict';

    console.log("Starting Heatmap Script...");

    // 1. Select the container
    const container = d3.select("#Airplane");

    // 2. Define the parts we want to track (IDs must match your .svg file)
    const airplaneParts = [
        "STR_RAD", "STR_WINDSHLD", "STR_ENG1", 
        "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"
    ];

    // 3. Load both the SVG and the CSV simultaneously
    Promise.all([
        d3.xml("/data/images/airplane.svg"), 
        d3.csv("/data/STRIKE_REPORTS.csv")
    ]).then(([xml, data]) => {
        
        console.log("SVG and CSV successfully loaded");

        // --- SVG INJECTION ---
        const importedNode = document.importNode(xml.documentElement, true);
        
        container.append("div")
            .attr("class", "blueprint-wrapper")
            .node()
            .appendChild(importedNode);

        const svg = d3.select("#airplane-blueprint");

        // --- DATA PROCESSING ---
        const airplaneData = data.filter(d => d.AC_CLASS === "A");

        let strikeCounts = {};
        airplaneParts.forEach(part => {
            strikeCounts[part] = d3.sum(airplaneData, d => {
                const val = String(d[part]).trim().toUpperCase();
                return (val === "TRUE" || val === "1") ? 1 : 0;
            });
        });

        // --- VISUALIZATION ---
        const maxStrikes = d3.max(Object.values(strikeCounts)) || 1;
        const colorScale = d3.scaleSequential()
            .domain([0, maxStrikes])
            .interpolator(d3.interpolateYlOrRd);

        // Apply Heatmap to SVG Parts
        airplaneParts.forEach(part => {
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

        // --- LEGEND CONSTRUCTION ---

        // 1. Define Gradient (Keep this the same)
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "heatmap-gradient");

        linearGradient.selectAll("stop")
            .data(d3.range(0, 1.1, 0.1))
            .enter().append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => d3.interpolateYlOrRd(d));

        // 2. Position Legend (Top Left)
        const legendWidth = 150;
        const legendHeight = 15;

        // Increase top margin slightly so the title (at y: -10) isn't cut off
        const margin = { left: 20, top: 35 }; 

        const legendGroup = svg.append("g")
            .attr("class", "legend")
            // FIX: Use margin.top directly instead of height - margin.bottom
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Draw the color bar
        legendGroup.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#heatmap-gradient)")
            .style("stroke", "#333")
            .style("stroke-width", "1px");

        // Add Label: 0
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", legendHeight + 15)
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .text("0");

        // Add Label: Max
        legendGroup.append("text")
            .attr("x", legendWidth)
            .attr("y", legendHeight + 15)
            .attr("text-anchor", "end")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            // Note: Ensure maxStrikes is defined in your scope
            .text(`${(maxStrikes / 1000).toFixed(1)}k Strikes`); 

        // Add Legend Title
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", -10) // This sits 10px above the rect
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .text("Bird Strike Intensity");

        console.log("Visualization and Legend complete.");

    }).catch(error => {
        console.error("Error loading files in heatmap script:", error);
    });

})();