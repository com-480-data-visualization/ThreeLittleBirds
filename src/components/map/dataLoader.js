import * as d3 from 'd3';

import { fromLonLat } from "ol/proj";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';

export async function clusterSource_from_data(data) {
  
// convert each data point to an OpenLayers Feature with a Point geometry
  const features = data.map(d => {
    return new Feature({
      geometry: new Point(fromLonLat([+d.lon, +d.lat])),
      ...d
    });
  });

  // create a cluster source that groups nearby points together
  const clusterSource = new Cluster({
    distance: 30, // adjust this distance to control how close points need to be to be clustered together, in pixels
    source: new VectorSource({ features }),
    createCluster : function (point, features) {
      return new Feature({
        geometry: point,
        features: features,
        size: features.length // add a 'size' property to indicate how many points are in this cluster, used for styling
      });
    }
  });

  return clusterSource;
}

export function migration_source_from_data(data) {
  console.log("migration rows", data.length); // log number of rows to check if data is loaded
  console.log("head rows", data.slice(0, 5)); // log first 5 rows to check structure
  console.log("coords sample", data.slice(0, 5).map(d => [d.GPS_xx, d.GPS_yy])); // log sample coordinates to check if they are in expected format and range

  const features = data.map(d => {
    return new Feature({
      geometry: new Point(fromLonLat([+d.GPS_xx, +d.GPS_yy])),
      ...d
    });
  });

  return new VectorSource({ features });
}