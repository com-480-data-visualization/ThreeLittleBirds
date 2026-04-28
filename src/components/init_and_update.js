import * as d3 from 'd3';

import { init_map } from './map/initMap.js';
import { init_heatmaps } from './damage/initHeatmaps.js';
import { init_barplots } from './barplot/initBarplot.js';

const state = {
  data: null,
  map: null,
  heatmaps: null,
  barplots: null
};

export async function init_visualizations() {
  state.data = await d3.csv('data/STRIKE_REPORTS_CLEAN.csv');

  state.map = init_map(state.data);
  state.heatmaps = init_heatmaps(state.data);
  state.barplots = init_barplots(state.data);
}

export function update_visualizations(filterFn) {
  const filtered = state.data.filter(filterFn);

  state.map.update(filtered);
  state.heatmaps.update(filtered);
  state.barplots.update(filtered);

  if (!state.data) return;
}