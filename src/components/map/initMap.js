import * as d3 from "d3";

import { createBaseLayer, refreshPointsLayer } from './layers.js';
import { clusterSource_from_data } from './dataLoader.js';
import { fromLonLat } from "ol/proj";
import Map from 'ol/Map';
import View from 'ol/View';

export function init_map(data, targetId = "primary-vis", layers = [createBaseLayer()], viewConfig = { center: fromLonLat([8.54, 47.37]), zoom: 5 }) {
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
      const clusterSource = await clusterSource_from_data(data);
      refreshPointsLayer(map, clusterSource);
  }

  initializeDataLayer();

  return map;
}