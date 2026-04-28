import WebGLVectorLayer from 'ol/layer/WebGLVector.js';
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

  const pointsLayer = new WebGLVectorLayer({
    source: clusterSource,
    style: {
      'circle-radius': ['interpolate', ['linear'], ['get', 'features'], 1, 6, 10, 12, 50, 20],
      'circle-fill-color': 'rgba(255, 0, 0, 0.6)',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 2,
    }
  });

  pointsLayer.set('id', 'pointsLayer');
  map.addLayer(pointsLayer);
}