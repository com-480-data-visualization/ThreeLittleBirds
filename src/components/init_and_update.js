import * as d3 from 'd3';

import { init_map } from './map/initMap.js';
import { init_heatmaps } from './damage/initHeatmaps.js';
import { init_barplots } from './barplot/initBarplot.js';
import { MIGRATION_LAYER_ID } from './map/layers.js';

const state = {
  data: null,
  map: null,
  heatmaps: null,
  barplots: null,
  migration_data: null
};

export async function init_visualizations() {
  // ensure initial render completes before heavy lifting
  await new Promise(requestAnimationFrame); 

  // fetch data concurrently to reduce loading times
  [state.data, state.migration_data] = await Promise.all([
    d3.csv('data/STRIKE_REPORTS_CLEAN.csv'),
    d3.csv('data/Bird_migration_dataset_renamed_CLEAN.csv')
  ]);

  const map_worker = new Worker(
    new URL('./workers/map_worker.js', import.meta.url),
    { type: 'module' }
  );

  map_worker.postMessage(state.data);

  map_worker.onmessage = (e) => {
    const features = e.data;
    
    // remove all loader overlays from the dom
    document.querySelectorAll('.vis-loader').forEach(el => el.remove());

    state.map = init_map(features, state.migration_data);
    state.heatmaps = init_heatmaps(state.data); 
    state.barplots = init_barplots(state.data); 
  };

  // toggle layer visibility based on checkbox state
  document.getElementById('toggleMigration').addEventListener('change', (e) => { 
    const layer = state.map.getLayers().getArray()
      .find(l => l.get('id') === MIGRATION_LAYER_ID);

    if (layer) {
      layer.setVisible(e.target.checked);
    }
  });

  const music = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');

  toggle.addEventListener('change', () => {
    // play music when the checkbox is checked
    if (toggle.checked) {
      music.play();
    } else {
      music.pause();
    }
  });
}

export function update_visualizations(filterFn) {
  const filtered = state.data.filter(filterFn);

  state.map.update(filtered);
  state.heatmaps.update(filtered);
  state.barplots.update(filtered);

  if (!state.data) return;
}