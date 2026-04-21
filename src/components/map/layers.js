import WebGLVectorLayer from 'ol/layer/WebGLVector.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export function createBaseLayer() {
  return new TileLayer({
    source: new OSM(),
  });
}

// update points layer, see https://openlayers.org/en/latest/examples/webgl-points-layer.html for reference

const pointStyle = {
  'circle-radius': 6,
  'circle-fill-color': 'red',
  'circle-stroke-color': 'white',
  'circle-stroke-width': 2,
};

let pointsLayer = null;

export function refreshPointsLayer(map, vectorSource, newStyle = pointStyle) {
  let previousLayer = null;

  map.getLayers().forEach(layer => {
    if (layer.get('id') === 'pointsLayer') {
      previousLayer = layer;
    }
  });

  pointsLayer = new WebGLVectorLayer({
    source: vectorSource,
    style: newStyle,
  });

  pointsLayer.set('id', 'pointsLayer');

  map.addLayer(pointsLayer);

  if (previousLayer) {
    map.removeLayer(previousLayer);
    previousLayer.dispose();
  }
}