export async function fetchJSON(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${url} HTTP ${r.status}`);
    return r.json();
  }
  