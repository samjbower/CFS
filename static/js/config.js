// Map & site constants, plus per-place story content
export const PLACES = {
  twinlakes: {
    label: 'Twin Lakes Reservoir',
    center: [-106.361, 39.082],
    zoom: 14.5,
    latestURL: '/api/cdss_latest?abbrev=TWITUNCO',
    seriesURL: '/api/cdss_series?abbrev=TWITUNCO&days=2',
    statSel: '#stat-twinlakes',
    chartSel: '#chart-twinlakes',
    story: {
      title: 'Background: Twin Lakes Tunnel',
      body: 'This tunnel diverts water under the Continental Divide into the Arkansas basin. what should we put here? Graphs?'
    }
  },
  aspen: {
    label: 'Roaring Fork near Aspen (USGS 09073400)',
    center: [-106.801389, 39.180000],
    zoom: 15,
    latestURL: '/api/usgs_latest?site=09073400&period=P2D',
    seriesURL: '/api/usgs_series?site=09073400&period=P2D',
    statSel: '#stat-aspen',
    chartSel: '#chart-aspen',
    story: {
      title: 'Background: Aspen Reach',
      body: 'Municipal supply, snowmelt, and recreation? Anecdotes relating to specific CFS values, pictures, etc'
    }
  },
  glenwood: {
    label: 'Roaring Fork at Glenwood Springs (USGS 09085000)',
    center: [-107.330833, 39.546667],
    zoom: 14,
    latestURL: '/api/usgs_latest?site=09085000&period=P2D',
    seriesURL: '/api/usgs_series?site=09085000&period=P2D',
    statSel: '#stat-glenwood',
    chartSel: '#chart-glenwood',
    story: {
      title: 'Background: Confluence & Ecology',
      body: 'Where the Roaring Fork meets the Colorado—note temperature, sediment, and habitat dynamics. Connect upstream management to downstream effects.'
    }
  }
};

// Leaflet fly behavior
export const FLY = { duration: 4.0, easeLinearity: 0.12 };
