import * as d3 from 'd3';

(function () {
    'use strict';

    console.log("start");
    // 1. Select the container from index.html
    const container = d3.select("#aircraft-damage");

    // 2. Embed the SVG Blueprint directly. 
    // This bypasses any Webpack/bundler file-loading issues.
    const svgBlueprint = `
    <svg id="airplane-blueprint" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; min-height: 250px; margin-top: 20px;">
      <path id="STR_FUSE" d="M180,40 Q200,30 220,40 L220,240 Q200,250 180,240 Z" fill="#e0e0e0" stroke="#333"/>
      <path id="STR_RAD" d="M180,40 Q200,10 220,40 Z" fill="#e0e0e0" stroke="#333"/>
      <rect id="STR_WINDSHLD" x="185" y="45" width="30" height="10" fill="#e0e0e0" stroke="#333"/>
      <path id="STR_WING_ROT" d="M180,100 L40,160 L40,180 L180,150 Z M220,100 L360,160 L360,180 L220,150 Z" fill="#e0e0e0" stroke="#333"/>
      <rect id="STR_ENG1" x="100" y="145" width="20" height="30" fill="#e0e0e0" stroke="#333"/>
      <rect id="STR_ENG2" x="280" y="145" width="20" height="30" fill="#e0e0e0" stroke="#333"/>
      <path id="STR_TAIL" d="M180,220 L140,260 L140,270 L260,270 L260,260 L220,220 Z" fill="#e0e0e0" stroke="#333"/>
    </svg>
    `;

    // Inject the SVG into the container
    container.append("div")
        .attr("class", "blueprint-wrapper")
        .html(svgBlueprint);

    const svg = d3.select("#airplane-blueprint");

    console.log(svgBlueprint);

    // 3. Define the parts we want to track (Must match the IDs in the SVG above)
    const airplaneParts = [
        "STR_RAD", "STR_WINDSHLD", "STR_ENG1", 
        "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"
    ];

    // 4. Load Data (Using the same path that works for tertiary_vis.js)
    d3.csv("/data/STRIKE_REPORTS.csv").then(function(data) {
        
        console.log("Successfully loaded csv");

        // Filter for Airplanes (Type A)
        const airplaneData = data.filter(d => d.AC_CLASS === "A");

        console.log("Filtering done");

        // Aggregate Counts per Part
        let strikeCounts = {};
        airplaneParts.forEach(part => {
        strikeCounts[part] = d3.sum(airplaneData, d => {
            // Check if the value is "TRUE". If yes, add 1. If no, add 0.
            // Using .toUpperCase() and .trim() just to be safe against messy CSV formatting like "True "
            const val = String(d[part]).trim().toUpperCase();
            return (val === "TRUE" || val === "1") ? 1 : 0;
            });
        })

        console.log("Strike Counts");
        console.log(strikeCounts);

        // 5. Create Color Scale
        const maxStrikes = d3.max(Object.values(strikeCounts)) || 1;
        const colorScale = d3.scaleSequential()
            .domain([0, maxStrikes])
            .interpolator(d3.interpolateYlOrRd);

        console.log("Color Scale done");

        // 6. Apply Heatmap to SVG
        airplaneParts.forEach(part => {
            const count = strikeCounts[part];
            
            // Apply color transition
            svg.select(`#${part}`)
                .transition()
                .duration(1000)
                .style("fill", count > 0 ? colorScale(count) : "#ffffff")
                .style("stroke", "#333")
                .style("stroke-width", "1px");

            // Add Interaction (Hover effects)
            svg.select(`#${part}`)
                .attr("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).style("stroke-width", "3px");
                    
                    // You can later connect this to a tooltip UI!
                    console.log(`Part: ${part} | Strikes: ${count}`); 
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-width", "1px");
                });
        });

        console.log("We should be done here");

    }).catch(error => {
        console.error("Error loading STRIKE_REPORTS.csv in secondary_vis:", error);
    });

})();