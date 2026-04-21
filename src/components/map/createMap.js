import Map from 'ol/Map';
import { fromLonLat } from "ol/proj";
import View from 'ol/View';
import { createBaseLayer, refreshPointsLayer } from './layers.js';
import { loadCSV } from './dataLoader.js';

export function createMap(targetId = "primary-vis", layers = [createBaseLayer()], viewConfig = { center: fromLonLat([8.54, 47.37]), zoom: 5 }) {
    const mapContainer = document.getElementById(targetId);

    if (!mapContainer) {
        console.error(`Map container not found: #${targetId}`);
        return;
    }

    const map = new Map({
        target: mapContainer,
        layers: layers,
        view: new View(viewConfig)
    });

        // Load data and add points layer
    async function initializeDataLayer() {
        const vectorSource = await loadCSV();
        refreshPointsLayer(map, vectorSource);
    }

    initializeDataLayer();

    return map;
}