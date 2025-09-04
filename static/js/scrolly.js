import { PLACES } from './config.js';
import { fetchJSON } from './api.js';
import { movingAverageTrailing, renderStatCard, renderMiniChart } from './charts.js';
import { flyToPlace } from './map.js';

const cache = { latest:{}, series:{} };

async function activateStep(key) {
  const p = PLACES[key]; if (!p) return;

  // camera
  flyToPlace(key);

  // data
  let latest, seriesResp;
  try { latest = cache.latest[key] = await fetchJSON(p.latestURL); } catch(e){ console.error(e); }
  try { seriesResp = cache.series[key] = cache.series[key] || await fetchJSON(p.seriesURL); } catch(e){ console.error(e); }

  // render
  const series = (seriesResp && seriesResp.series) ? seriesResp.series : [];
  const sm = movingAverageTrailing(series, 4);
  const latestISO = latest ? latest.datetime : (series.length ? series[series.length - 1].dt : null);
  const units = (latest && latest.units) ? latest.units : 'cfs';

  renderStatCard(p.statSel, p.label, units, latestISO, sm, 4);
  renderMiniChart(p.chartSel, series);
}

export function initScrolly() {
  const steps = document.querySelectorAll('.step');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      steps.forEach(s => s.classList.remove('is-active'));
      entry.target.classList.add('is-active');
      activateStep(entry.target.getAttribute('data-key'));
    });
  }, { root: null, threshold: 0.6 });
  steps.forEach(s => io.observe(s));

  // prefetch + prime first view
  (async () => {
    for (const key of Object.keys(PLACES)) {
      fetchJSON(PLACES[key].latestURL).then(d => cache.latest[key]=d).catch(()=>{});
      fetchJSON(PLACES[key].seriesURL).then(d => cache.series[key]=d).catch(()=>{});
    }
    activateStep('twinlakes');
  })();
}
