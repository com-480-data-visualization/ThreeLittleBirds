import * as d3 from "d3";

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

(function () {
    const mapContainer = document.getElementById("primary-vis");

    if (!mapContainer) return;

    const map = new Map({
        target: 'primary-vis',
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        view: new View({
            center: fromLonLat([8.54, 47.37]), // e.g. Zurich
            zoom: 5
        })
    });

    d3.csv('data/STRIKE_REPORTS_CLEAN.csv').then(data => {
        const features = data.map(d => {
            return new Feature({
                geometry: new Point(fromLonLat([+d.LONGITUDE, +d.LATITUDE]))
            });
        });

        const vectorSource = new VectorSource({
            features: features
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({ color: 'red' }),
                    stroke: new Stroke({ color: 'white', width: 2 })
                })
            })
        });

        map.addLayer(vectorLayer);
    });
})();