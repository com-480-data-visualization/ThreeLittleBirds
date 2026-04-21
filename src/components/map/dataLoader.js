import * as d3 from 'd3';

import { fromLonLat } from "ol/proj";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';


export async function loadGeoJSON(url) {
  const res = await fetch(url);
  return res.json();
}

export async function loadCSV() {
  const data = await d3.csv('data/STRIKE_REPORTS_CLEAN.csv');

  const features = data.map(d => {
    return new Feature({
      geometry: new Point(fromLonLat([+d.LONGITUDE, +d.LATITUDE]))
    });
  });

  return new VectorSource({
    features: features
  });
}