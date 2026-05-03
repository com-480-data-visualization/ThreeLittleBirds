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
    
    // clear existing content to prevent rendering duplicates
    container.selectAll("*").remove();

    // setup dynamic tooltip element appended directly to the body
    let tooltip = d3.select("body").select(".heatmap-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "heatmap-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255, 255, 255, 0.95)")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
            .style("z-index", "1000");
    }

    // load the specific svg for this tab
    d3.xml(svgPath).then(xml => {
        const importedNode = document.importNode(xml.documentElement, true);
        const svg = d3.select(importedNode);
        
        // get existing dimensions to create a viewbox
        const originalWidth = svg.attr("width") || 800;
        const originalHeight = svg.attr("height") || 800;

        if (!svg.attr("viewBox")) {
            svg.attr("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
        }

        // remove fixed width and height to allow responsive scaling
        svg.attr("width", null)
           .attr("height", null)
           .attr("preserveAspectRatio", "xMidYMid meet")
           .style("width", "100%")
           .style("height", "100%");

        // append to container and set flexbox styles to center the blueprint
        const wrapper = container.append("div")
            .attr("class", "blueprint-wrapper")
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center");

        wrapper.node().appendChild(importedNode);

        // filter the core dataset by aircraft class
        const filteredData = data.filter(d => d.AC_CLASS === acClass);

        // aggregate comprehensive numerical data for each damage zone
        const partStats = {};
        
        // iterate over parts to calculate all required tooltip stats
        parts.forEach(part => {
            // isolate the subset of records where this specific part was struck
            const partData = filteredData.filter(d => {
                const val = String(d[part]).trim().toUpperCase();
                return (val === "TRUE" || val === "1");
            });
            
            // extract additional variables into a consolidated object
            partStats[part] = {
                strikes: partData.length,
                // aggregate custom numerical columns from the dataset
                avgCost: partData.length ? d3.mean(partData, d => Number(d.COST_REPAIRS) || 0) : 0,
                injuries: d3.sum(partData, d => Number(d.NR_INJURIES) || 0)
            };
        });

        // calculate max strikes dynamically for the color domain
        const maxStrikes = d3.max(Object.values(partStats), d => d.strikes) || 1;
        const colorScale = d3.scaleSequential()
            .domain([0, maxStrikes])
            .interpolator(d3.interpolateYlOrRd);

        // apply colors and bind positional hover interactions to the svg parts
        parts.forEach(part => {
            const stats = partStats[part];
            const partElement = svg.select(`#${part}`);

            if (partElement.empty()) return;
            
            partElement.transition()
                .duration(1000)
                .style("fill", stats.strikes > 0 ? colorScale(stats.strikes) : "#e0e0e0")
                .style("stroke", "#333")
                .style("stroke-width", "1px");

            // attach interaction events directly within the local lexical scope
            partElement.attr("cursor", "pointer")
                .on("mouseover", function(event) {
                    // highlight the outline of the active damage zone
                    d3.select(this).style("stroke-width", "3px");
                    
                    // inject the dynamic data block into the tooltip html
                    tooltip.html(`
                        <strong>Damage Zone: ${part}</strong><br/>
                        Total Strikes: ${stats.strikes}<br/>
                        Avg Repair Cost: $${stats.avgCost.toFixed(2)}<br/>
                        Total Injuries: ${stats.injuries}
                    `);
                    
                    // reveal the tooltip element
                    tooltip.style("visibility", "visible");
                })
                .on("mousemove", function(event) {
                    // anchor the tooltip coordinates relative to the cursor position
                    tooltip.style("top", (event.pageY + 15) + "px")
                           .style("left", (event.pageX + 15) + "px");
                })
                .on("mouseout", function() {
                    // revert the stroke width to default
                    d3.select(this).style("stroke-width", "1px");
                    
                    // hide the tooltip visually
                    tooltip.style("visibility", "hidden");
                });
        });

        // create a unique gradient legend for the tab
        const gradientId = `gradient-${acClass}`;
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