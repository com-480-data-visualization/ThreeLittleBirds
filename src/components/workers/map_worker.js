self.onmessage = (e) => {
  const data = e.data;

  const result = data.map(d => ({
    lon: +d.LONGITUDE,
    lat: +d.LATITUDE,
    size: +d.SIZE
    // include any other properties you want to use in the visualization, e.g.: date: d.DATE, species: d.SPECIES, etc.
  }));

  postMessage(result);
};