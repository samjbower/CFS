// D3 helpers + renderers (used by app.js)
export function movingAverageTrailing(series, window = 4) {
    const out = [], vals = [];
    for (let i = 0; i < series.length; i++) {
      const dt = new Date(series[i].dt);
      const raw = (series[i].val == null || isNaN(series[i].val)) ? null : +series[i].val;
      vals.push(raw);
      const start = Math.max(0, i - window + 1);
      const slice = vals.slice(start, i + 1).filter(v => v != null);
      const ma = (slice.length === window) ? d3.mean(slice) : null;
      out.push({ dt, raw, ma });
    }
    return out;
  }
  
  export function computeTrendMA(smoothed, window = 4) {
    let i = smoothed.length - 1;
    while (i >= 0 && (smoothed[i].ma == null || isNaN(smoothed[i].ma))) i--;
    if (i < 0) return { latest:null, prev:null, delta:null, dir:'flat' };
  
    const latest = smoothed[i].ma;
    let j = i - window;
    while (j >= 0 && (smoothed[j].ma == null || isNaN(smoothed[j].ma))) j--;
    if (j < 0) return { latest, prev:null, delta:null, dir:'flat' };
  
    const prev = smoothed[j].ma;
    const delta = latest - prev;
    let dir = 'flat'; const eps = 1e-6;
    if (delta > eps) dir = 'up'; else if (delta < -eps) dir = 'down';
    return { latest, prev, delta, dir };
  }
  
  function fmtLocal(dtISO) {
    if (!dtISO) return '—';
    const d = new Date(dtISO);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} @ ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  
  export function renderStatCard(sel, label, units, latestISO, smoothed, window = 4) {
    const container = d3.select(sel);
    container.selectAll('*').remove();
  
    const trend = computeTrendMA(smoothed, window);
    const latestVal = trend.latest, delta = trend.delta, dir = trend.dir;
    const arrowUp='M6,12 L12,6 L18,12', arrowDown='M6,8 L12,14 L18,8';
  
    const head = container.append('div').attr('class','stathead');
    head.append('div').attr('class','statlabel').text(label);
    head.append('div').attr('class','stattime').text(fmtLocal(latestISO));
  
    const row = container.append('div').attr('class','statrow');
    const valueWrap = row.append('div');
    valueWrap.append('span').attr('class','statvalue')
      .text((latestVal==null||isNaN(latestVal))?'—':d3.format(',')(d3.format('.1f')(latestVal)));
    valueWrap.append('span').attr('class','statunits').text(` ${units||'cfs'}`);
  
    const deltaWrap = row.append('div').attr('class','statdelta ' + (dir==='up'?'delta-up':dir==='down'?'delta-down':'delta-flat'));
    const svg = deltaWrap.append('svg').attr('class','arrow').attr('viewBox','0 0 24 24');
    svg.append('path').attr('d', dir==='down'?arrowDown:arrowUp).attr('fill','none')
      .attr('stroke','currentColor').attr('stroke-width','3').attr('stroke-linecap','round').attr('stroke-linejoin','round');
    const deltaText = (delta==null||isNaN(delta))?'—':((dir==='flat')?'0.0':d3.format('.1f')(Math.abs(delta)));
    deltaWrap.append('span').text(` ${deltaText}`);
  }
  
  export function renderMiniChart(sel, series) {
    const el = d3.select(sel); el.selectAll('*').remove();
    const W = el.node().clientWidth || 520; // fill card width
    const H = 180;                           // taller chart
    const M = { t:12, r:16, b:24, l:40 };
  
    const svg = el.append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    const w = W - M.l - M.r, h = H - M.t - M.b;
  
    if (!series || !series.length) { g.append('text').attr('x',4).attr('y',16).text('No data').attr('fill','#666'); return; }
  
    const sm = movingAverageTrailing(series, 4);
    const haveRaw = sm.some(d => d.raw != null);
    const haveMA  = sm.some(d => d.ma  != null);
    if (!haveRaw && !haveMA) { g.append('text').attr('x',4).attr('y',16).text('No numeric data').attr('fill','#666'); return; }
  
    const x = d3.scaleTime().domain(d3.extent(sm, d => d.dt)).range([0, w]);
    const yDomain = [...sm.filter(d=>d.raw!=null).map(d=>d.raw), ...sm.filter(d=>d.ma!=null).map(d=>d.ma)];
    const y = d3.scaleLinear().domain(d3.extent(yDomain)).nice().range([h, 0]);
  
    const rawLine = d3.line().defined(d=>d.raw!=null).x(d=>x(d.dt)).y(d=>y(d.raw));
    const maLine  = d3.line().defined(d=>d.ma !=null).x(d=>x(d.dt)).y(d=>y(d.ma));
  
    if (haveRaw) g.append('path').datum(sm).attr('d',rawLine).attr('fill','none').attr('stroke','#b7d7c9').attr('stroke-width',1.5)
      .attr('stroke-linejoin','round').attr('stroke-linecap','round');
    if (haveMA)  g.append('path').datum(sm).attr('d',maLine ).attr('fill','none').attr('stroke','var(--accent)').attr('stroke-width',2.5)
      .attr('stroke-linejoin','round').attr('stroke-linecap','round');
  
    g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).ticks(4).tickSizeOuter(0));
    g.append('g').call(d3.axisLeft(y).ticks(4).tickSizeOuter(0)).call(g=>g.selectAll('.domain').attr('opacity',0.4));
  
    const legend = g.append('g').attr('transform',`translate(${w-120},4)`);
    if (haveRaw) { legend.append('line').attr('x1',0).attr('y1',6).attr('x2',18).attr('y2',6).attr('stroke','#b7d7c9').attr('stroke-width',2);
                   legend.append('text').attr('x',24).attr('y',10).text('raw').attr('font-size',10).attr('fill','#666'); }
    if (haveMA)  { const yOff = haveRaw ? 18 : 6;
                   legend.append('line').attr('x1',0).attr('y1',yOff).attr('x2',18).attr('y2',yOff).attr('stroke','var(--accent)').attr('stroke-width',3);
                   legend.append('text').attr('x',24).attr('y',yOff+4).text('1-hr MA').attr('font-size',10).attr('fill','#333'); }
  }
  