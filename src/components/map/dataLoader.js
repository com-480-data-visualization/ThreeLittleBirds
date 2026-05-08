import * as d3 from 'd3';

import { fromLonLat } from "ol/proj";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import { LineString } from 'ol/geom';

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

  // filter out any routes or IDs that are known to be problematic based on the exploration phase, e.g. routes with large jumps that likely indicate data quality issues
  const excludedRoutes = new Set(["NA", "1418.0"]);
  const excludedIds = new Set(["NA", "775.0", "42766.0", "42660.0" , "42686.0"]);

  const filtered = data.filter(d =>
    !excludedRoutes.has(d["Migratory route codes"]) &&
    !excludedIds.has(d["ID"])
  );

  // group data points by migratory route code
  const grouped = {};
  filtered.forEach(d => {
    const key = `${d["English Name"]}_${d["Migratory route codes"]}`;
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  // Assign a unique color to each species (you can customize this color mapping as needed)
  const speciesColors = {};
  let colorIndex = 0;
  Object.keys(grouped).forEach(key => {
    const species = key.split('_')[0];
    console.log(species);
    if (!speciesColors[species]) {
      const color = d3.schemeCategory10[colorIndex % 10];
      const rgb = d3.color(color).rgb();

      speciesColors[species] = [rgb.r, rgb.g, rgb.b, 0.2];
      colorIndex++;
    }
  });


  // convert each group of points into a LineString feature representing the migration route
  const features = Object.values(grouped).map(points => {
    
    points.sort((a,b) => a.ID - b.ID);

    let previous_lon = null; // track the previous longitude to detect dateline crossings

    const coords = points.map(d => {

      let lon = +d.GPS_xx;
      let lat = +d.GPS_yy;

      // If the route crosses the dateline, adjust longitudes to ensure the LineString is drawn correctly (e.g. if median longitude is positive but some points are negative, add 360 to those points to keep them in the same range)
      if (previous_lon !== null) {
        let delta = lon-previous_lon;
        if (delta > 180) {
          lon -= 360;
        } else if (delta < -180) {
          lon += 360;
        }
      }

      previous_lon = lon; // update previous longitude for next iteration
      
      return fromLonLat([lon, lat]);
    });

    return new Feature({
      geometry: new LineString(coords),
      migration_route: points[0].migration_route,
      Migratory_route_code: points[0].Migratory_route_code,
      Bird_species: points[0]["English Name"],
      color: speciesColors[points[0]["English Name"]],
      width: 2,
      selected: false
    });
  });

  return new VectorSource({ features });
}