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

  await new Promise(requestAnimationFrame); // ensure this runs after the initial render, so we don't block the UI with data loading and processing

  state.data = await d3.csv('data/STRIKE_REPORTS_CLEAN.csv');
  state.migration_data = await d3.csv('data/Bird_migration_dataset_renamed.csv');

  const map_worker = new Worker(
    new URL('./workers/map_worker.js', import.meta.url),
    { type: 'module' }
  );

  map_worker.postMessage(state.data);

  map_worker.onmessage = (e) => {
    const features = e.data;

    state.map = init_map(features, state.migration_data);
    state.heatmaps = init_heatmaps(state.data); // could also pass processed features here if heatmaps need them, but for now they just use the raw data
    state.barplots = init_barplots(state.data); // could also pass processed features here if barplots need them, but for now they just use the raw data and do their own processing/filtering as needed
  };

  document.getElementById('toggleMigration').addEventListener('change', (e) => { // toggle visibility of migration layer when checkbox is changed
    const layer = state.map.getLayers().getArray()
      .find(l => l.get('id') === MIGRATION_LAYER_ID);

    if (layer) {
      layer.setVisible(e.target.checked);
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