import * as d3 from 'd3';

import { fromLonLat } from "ol/proj";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';

export async function clusterSource_from_data() {
  const data = await d3.csv('data/STRIKE_REPORTS_CLEAN.csv');

  const features = data.map(d => {
    return new Feature({
      geometry: new Point(fromLonLat([+d.LONGITUDE, +d.LATITUDE]))
    });
  });

  const clusterSource = new Cluster({
    distance: 40,
    source: new VectorSource({ features }),
  });

  return clusterSource;
}