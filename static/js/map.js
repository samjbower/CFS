import { PLACES, FLY } from './config.js';

let map;
const markers = {};
const defaultStyle = { radius:7, color:'#000', weight:2, fillColor:'#e11', fillOpacity:0.5 };
const activeStyle  = { radius:10, color:'#000', weight:3, fillColor:'#e11', fillOpacity:0.5 };

export function initMap() {
  map = L.map('map', {
    zoomControl: true, attributionControl: true,
    zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 90
  }).setView([39.25, -106.9], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // create labeled markers
  Object.keys(PLACES).forEach((key) => {
    const p = PLACES[key];
    const cm = L.circleMarker([p.center[1], p.center[0]], defaultStyle)
      .addTo(map)
      .bindTooltip(p.label, { permanent:true, direction:'top', offset:L.point(0,-10), className:'site-label' });
    markers[key] = cm;
  });

  setActiveMarker('twinlakes');
  map.setView([PLACES.twinlakes.center[1], PLACES.twinlakes.center[0]], PLACES.twinlakes.zoom);
  window.addEventListener('resize', () => map.invalidateSize());
  return map;
}

export function setActiveMarker(keyActive) {
  Object.entries(markers).forEach(([key, m]) => {
    if (key === keyActive) {
      m.setStyle(activeStyle); m.bringToFront();
      const el = m.getElement(); if (el) el.classList.add('marker-active');
    } else {
      m.setStyle(defaultStyle);
      const el = m.getElement(); if (el) el.classList.remove('marker-active');
    }
  });
}

export function flyToPlace(key) {
  const p = PLACES[key]; if (!p) return;
  map.flyTo([p.center[1], p.center[0]], p.zoom ?? 14, { animate:true, duration: FLY.duration, easeLinearity: FLY.easeLinearity });
  setActiveMarker(key);
}
