import { PLACES, FLY } from './config.js';

let map;
const markers = {};
let overlayEl, overlayImgEl;   // image overlay (kept)
let storyEl, storyTitleEl, storyBodyEl; // NEW story overlay
let hideTimer;

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

  // Markers with labels
  Object.keys(PLACES).forEach((key) => {
    const p = PLACES[key];
    const cm = L.circleMarker([p.center[1], p.center[0]], defaultStyle)
      .addTo(map)
      .bindTooltip(p.label, { permanent:true, direction:'top', offset:L.point(0,-10), className:'site-label' });
    markers[key] = cm;
  });

  const mapContainer = document.getElementById('map');

  // Image overlay (existing)
  overlayEl = document.createElement('div');
  overlayEl.className = 'map-overlay hidden';
  overlayImgEl = document.createElement('img');
  overlayImgEl.className = 'map-overlay-img';
  overlayEl.appendChild(overlayImgEl);
  mapContainer.appendChild(overlayEl);

  // NEW: Story overlay (card)
  storyEl = document.createElement('div');
  storyEl.className = 'story-overlay'; // starts hidden via opacity 0
  const card = document.createElement('div');
  card.className = 'story-card';
  storyTitleEl = document.createElement('h3');
  storyBodyEl  = document.createElement('p');
  card.appendChild(storyTitleEl);
  card.appendChild(storyBodyEl);
  storyEl.appendChild(card);
  mapContainer.appendChild(storyEl);

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
  map.flyTo([p.center[1], p.center[0]], p.zoom ?? 14, {
    animate:true, duration: FLY.duration, easeLinearity: FLY.easeLinearity
  });
  setActiveMarker(key);
  hideStory(); // hide story when returning to a map step
}

/* Optional image overlay still available if you want to use it later */
export function showOverlayFor(key) {
  const p = PLACES[key];
  if (!p || !p.overlay || !overlayEl || !overlayImgEl) return;
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  overlayImgEl.src = p.overlay.src;
  overlayEl.style.setProperty('--overlay-opacity', String(p.overlay.opacity ?? 0.95));
  overlayEl.classList.remove('hidden'); overlayEl.classList.add('visible');
  const dur = Number(p.overlay.duration ?? 0);
  if (dur > 0) hideTimer = setTimeout(() => hideOverlay(), dur);
}
export function hideOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.remove('visible'); overlayEl.classList.add('hidden');
}

/* NEW: Story card overlay controls */
export function showStory(key) {
  const p = PLACES[key.replace('-story','')]; // map story key -> place key
  if (!p || !p.story || !storyEl) return;
  storyTitleEl.textContent = p.story.title || p.label;
  storyBodyEl.textContent  = p.story.body || '';
  storyEl.classList.add('visible');
}
export function hideStory() {
  if (!storyEl) return;
  storyEl.classList.remove('visible');
}
