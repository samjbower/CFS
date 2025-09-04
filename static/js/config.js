// Map & site constants in one place
export const PLACES = {
    twinlakes: {
      label: 'Twin Lakes Reservoir',
      center: [-106.361, 39.082], // [lng, lat]
      zoom: 14.5,
      latestURL: '/api/cdss_latest?abbrev=TWITUNCO',
      seriesURL: '/api/cdss_series?abbrev=TWITUNCO&days=2',
      statSel: '#stat-twinlakes',
      chartSel: '#chart-twinlakes'
    },
    aspen: {
      label: 'Roaring Fork near Aspen (USGS 09073400)',
      center: [-106.801389, 39.180000],
      zoom: 15,
      latestURL: '/api/usgs_latest?site=09073400&period=P2D',
      seriesURL: '/api/usgs_series?site=09073400&period=P2D',
      statSel: '#stat-aspen',
      chartSel: '#chart-aspen'
    },
    glenwood: {
      label: 'Roaring Fork at Glenwood Springs (USGS 09085000)',
      center: [-107.330833, 39.546667],
      zoom: 14,
      latestURL: '/api/usgs_latest?site=09085000&period=P2D',
      seriesURL: '/api/usgs_series?site=09085000&period=P2D',
      statSel: '#stat-glenwood',
      chartSel: '#chart-glenwood'
    }
  };
  
  // Leaflet fly behaviour
  export const FLY = {
    duration: 4.0,      // higher = slower
    easeLinearity: 0.12 // lower = smoother
  };
  