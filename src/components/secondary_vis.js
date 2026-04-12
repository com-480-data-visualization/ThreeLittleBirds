import * as d3 from 'd3';

(function () {
    'use strict';

    console.log("Starting Heatmap Script...");

    // 1. Select the container
    const container = d3.select("#aircraft-damage");

    // 2. Define the parts we want to track (IDs must match your .svg file)
    const airplaneParts = [
        "STR_RAD", "STR_WINDSHLD", "STR_ENG1", 
        "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"
    ];

    // 3. Load both the SVG and the CSV simultaneously
    // Ensure the path to your SVG is correct relative to your server root
    Promise.all([
        d3.xml("/data/images/airplane.svg"), // Update this path to where your file lives
        d3.csv("/data/STRIKE_REPORTS.csv")
    ]).then(([xml, data]) => {
        
        console.log("SVG and CSV successfully loaded");

        // --- SVG INJECTION ---
        // Inject the loaded SVG into the container
        const importedNode = document.importNode(xml.documentElement, true);
        
        container.append("div")
            .attr("class", "blueprint-wrapper")
            .node()
            .appendChild(importedNode);

        // Select the newly injected SVG to work with it
        // Note: Make sure the <svg> tag inside your .svg file has this ID
        const svg = d3.select("#airplane-blueprint");

        // --- DATA PROCESSING ---
        // Filter for Airplanes (Type A)
        const airplaneData = data.filter(d => d.AC_CLASS === "A");

        // Aggregate Counts per Part
        let strikeCounts = {};
        airplaneParts.forEach(part => {
            strikeCounts[part] = d3.sum(airplaneData, d => {
                const val = String(d[part]).trim().toUpperCase();
                return (val === "TRUE" || val === "1") ? 1 : 0;
            });
        });

        console.log("Strike Counts:", strikeCounts);

        // --- VISUALIZATION ---
        // Create Color Scale
        const maxStrikes = d3.max(Object.values(strikeCounts)) || 1;
        const colorScale = d3.scaleSequential()
            .domain([0, maxStrikes])
            .interpolator(d3.interpolateYlOrRd);

        // Apply Heatmap to SVG
        airplaneParts.forEach(part => {
            const count = strikeCounts[part];
            const partElement = svg.select(`#${part}`);

            if (partElement.empty()) {
                console.warn(`Warning: ID #${part} not found in the imported SVG.`);
                return;
            }
            
            // Apply color transition
            partElement.transition()
                .duration(1000)
                .style("fill", count > 0 ? colorScale(count) : "#e0e0e0")
                .style("stroke", "#333")
                .style("stroke-width", "1px");

            // Add Interaction
            partElement.attr("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).style("stroke-width", "3px");
                    console.log(`Part: ${part} | Strikes: ${count}`); 
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-width", "1px");
                });
        });

        console.log("Visualization complete.");

    }).catch(error => {
        console.error("Error loading files in heatmap script:", error);
    });

})();