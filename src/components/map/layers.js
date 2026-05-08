import WebGLVectorLayer from 'ol/layer/WebGLVector.js';
import VectorLayer from 'ol/layer/Vector.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature.js';

import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';

export function createBaseLayer() {
  return new TileLayer({
    source: new OSM(),
  });
}

// update points layer, see https://openlayers.org/en/latest/examples/webgl-points-layer.html for reference

const POINTS_LAYER_ID = 'pointsLayer';
export const MIGRATION_LAYER_ID = 'migrationLayer';

export function refreshPointsLayer(map, clusterSource) {
  let existingLayer = null;

  map.getLayers().forEach(layer => {
    if (layer.get('id') === POINTS_LAYER_ID) {
      existingLayer = layer;
    }
  });

  if (existingLayer) {
    existingLayer.setSource(clusterSource);
    existingLayer.changed(); // ensures re-render if needed
    return;
  }

  const pointsLayer = new WebGLVectorLayer({ // use WebGL for better performance with many points, but does not support writing text lables or hover interactions
    source: clusterSource, // check out multi-scale rendering, or adding layer with labels that are only visible at certain zoom levels (zoom dependent styling)
    style: {
      'circle-radius': ['interpolate', ['exponential', 1.75], ['get', 'size'], 1, 4,
                                                                    10, 6, 
                                                                    50, 9,
                                                                    100, 12,
                                                                    150, 14,
                                                                    200, 16,
                                                                    250, 17,
                                                                    400, 20,
                                                                    500, 23,
                                                                    700, 26], // use exponential interpolation for better visual scaling, adjust breakpoints and sizes as needed
      'circle-fill-color': ['interpolate', ['exponential', 1.75], ['get', 'size'], 1,   '#1f4e79',  // dark blue (very visible on light bg)
  10,  '#2b83ba',
  50,  '#4aa3c7',
  100, '#3f7fbf',
  150, '#6c63c7',
  200, '#8e44ad',
  250, '#b23a48',
  400, '#d64541',
  500, '#e74c3c',
  700, '#c0392b'], // add a color gradient based on size as well
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1
    }
  });

  pointsLayer.set('id', POINTS_LAYER_ID);
  map.addLayer(pointsLayer);
}

export function createMigrationLayer(map, vectorSource) {
  let existingLayer = null;

  map.getLayers().forEach(layer => {
    if (layer.get('id') === MIGRATION_LAYER_ID) {
      existingLayer = layer;
    }
  });

  if (existingLayer) {
    existingLayer.setSource(vectorSource);
    existingLayer.changed(); // ensures re-render if needed
    return;
  }
  const migrationLayer = new WebGLVectorLayer({
    source: vectorSource,
    style: {
    'stroke-color': ['get', 'color'], 
    'stroke-width': ['get', 'width']
    }
  });

  migrationLayer.set('id', MIGRATION_LAYER_ID);
  migrationLayer.setVisible(false);
  map.addLayer(migrationLayer);

  // add click interaction to highlight selected migration route
  const selectedFeatures = new Set();

  map.on('click', event => {

    let clickedAnyFeature = false;

    map.forEachFeatureAtPixel(event.pixel, feature => {
      clickedAnyFeature = true;

        // already selected -> deselect
        if (selectedFeatures.has(feature)) {
          const baseColor = feature.get('color').slice(0, 3);
          feature.set('color', [...baseColor, 0.2]);
          feature.set('width', 1.5);
          feature.set('selected', false);

          selectedFeatures.delete(feature);

        } else {
          // newly selected -> highlight
          const baseColor = feature.get('color').slice(0, 3);
          feature.set('color', [...baseColor, 1.0]);
          feature.set('width', 4);
          feature.set('selected', true);

          selectedFeatures.add(feature);
        }

        return true;
      });

      migrationLayer.changed();

      if (!clickedAnyFeature) {
      // Clear selection if click on empty space
      selectedFeatures.forEach(feature => {
        feature.set('opacity', 0.15);
        feature.set('width', 1.5);
        feature.set('selected', false);
      });
    }
  });
}

export function createBirdSpeciesLayer(map, vectorSource) {
  const labelLayer = new VectorLayer({
    source: vectorSource,
    style: feature => {

      if (!feature.get('selected')) {
        return null; // only label selected feature
      }

      return new Style({
        text: new Text({
          text: feature.get('Bird_species'),

          font: '14px sans-serif',

          fill: new Fill({
            color: '#fff'
          }),

          stroke: new Stroke({
            color: '#000',
            width: 3
          }),

          overflow: true,
          placement: 'line'
        })
      });
    }
  });

  map.addLayer(labelLayer);
}