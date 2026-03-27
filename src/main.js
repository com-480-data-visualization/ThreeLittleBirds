import './styles/main.css';
import * as d3 from 'd3'; // Just to test it's working

const routes = {
    '#home': '<h1>Welcome to our Project</h1><p>Select a visualization above.</p>',
    '#viz1': '<h1>D3 Chart</h1><div id="chart"></div>',
    '#map': '<h1>Interactive Map</h1><div id="map-container"></div>',
};

function router() {
    const content = routes[window.location.hash] || routes['#home'];
    document.getElementById('app').innerHTML = content;

    if (window.location.hash === '#viz1') {
        // You would call your D3 functions here
        d3.select("#chart").append("p").text("D3 is loaded!");
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);