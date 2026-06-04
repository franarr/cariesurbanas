/**
 * =====================================================
 * CARIES URBANAS — WebGIS v2.2
 * Observatorio Urbano · Santa Fe, Argentina
 * =====================================================
 */

const CONFIG = {
    center: [-60.700, -31.630],
    zoom: 12.5,
    minZoom: 10,
    maxZoom: 18,
    geojsonPath: 'caries_puntos.geojson',
    distritosPath: 'distritos.geojson',
    tileStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    satelliteTiles: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    districtCenters: {
        'TODOS':    { center: [-60.700, -31.630], zoom: 12.5 },
        'CENTRO':   { center: [-60.710, -31.648], zoom: 13.5 },
        'ESTE':     { center: [-60.685, -31.612], zoom: 13 },
        'OESTE':    { center: [-60.720, -31.610], zoom: 13 },
        'SUROESTE': { center: [-60.727, -31.655], zoom: 13.5 },
        'NOROESTE': { center: [-60.740, -31.582], zoom: 13 },
        'NORESTE':  { center: [-60.680, -31.585], zoom: 13 },
        'NORTE':    { center: [-60.712, -31.590], zoom: 13 },
        'LA COSTA': { center: [-60.660, -31.650], zoom: 12 }
    },
    treatingIds: ['54','55','27','56','57','37','58','59','41','22'],
    treatedIds: ['21','12','48','3','20','25']
};

const State = {
    map: null,
    geojson: null,
    distritos: null,
    activeDistricts: [],
    activeStatus: 'all',
    isMeasuring: false,
    measureFinished: false,
    measurePts: [],
    carouselIndex: 0,
    carouselTotal: 4
};

// ─── UTILITIES ───────────────────────────────────────
function animateNum(el, target, dur = 1000) {
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    const startTime = performance.now();
    function step(now) {
        const p = Math.min((now - startTime) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + diff * e);
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// Simulate statuses for UI demonstration since the real data doesn't have it
function assignStatus(geojson) {
    const rous = ['R2a', 'C2b', 'C2', 'C2c', 'Otros'];
    geojson.features.forEach((f, i) => {
        const id = String(f.properties.nro);
        if (CONFIG.treatedIds.includes(id)) f.properties.status = 'treated';
        else if (CONFIG.treatingIds.includes(id)) f.properties.status = 'treating';
        else f.properties.status = 'untreated';
        
        // Simular datos ROU para demostración (ya que no existen en el GeoJSON original)
        f.properties.rou = rous[i % rous.length];
    });
    return geojson;
}

function getFiltered() {
    let features = State.geojson.features;
    if (State.activeDistricts.length > 0) {
        features = features.filter(f => State.activeDistricts.includes(f.properties.distrito));
    }
    if (State.activeStatus !== 'all') {
        features = features.filter(f => f.properties.status === State.activeStatus);
    }
    return { type: 'FeatureCollection', features };
}

// ─── MAP INIT ────────────────────────────────────────
async function initMap() {
    State.map = new maplibregl.Map({
        container: 'map',
        style: CONFIG.tileStyle,
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        attributionControl: false
    });
    State.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    return new Promise(r => State.map.on('load', r));
}

async function loadData() {
    const [geoRes, distRes] = await Promise.all([
        fetch(CONFIG.geojsonPath),
        fetch(CONFIG.distritosPath).catch(() => null)
    ]);
    State.geojson = assignStatus(await geoRes.json());
    if (distRes && distRes.ok) {
        State.distritos = await distRes.json();
    }
}

// ─── MAP LAYERS ──────────────────────────────────────
function addSourcesAndLayers() {
    const map = State.map;

    // 1. SATELLITE (Raster)
    map.addSource('satellite', {
        type: 'raster',
        tiles: [CONFIG.satelliteTiles],
        tileSize: 256
    });
    map.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        layout: { visibility: 'visible' }
    }, map.getStyle().layers.find(l => l.id.includes('water'))?.id);

    // 2. DISTRICTS
    if (State.distritos) {
        map.addSource('distritos', { type: 'geojson', data: State.distritos });
        map.addLayer({
            id: 'distritos-fill',
            type: 'fill',
            source: 'distritos',
            paint: {
                'fill-color': [
                    'match', ['get', 'name'],
                    'NORTE', 'rgba(249,168,37,0.18)',
                    'NOROESTE', 'rgba(175,180,43,0.18)',
                    'ESTE', 'rgba(230,81,0,0.18)',
                    'NORESTE', 'rgba(129,119,23,0.18)',
                    'SUROESTE', 'rgba(121,85,72,0.18)',
                    'OESTE', 'rgba(15,157,88,0.18)',
                    'CENTRO', 'rgba(255,82,82,0.18)',
                    'LA COSTA', 'rgba(85,139,47,0.18)',
                    'rgba(255,255,255,0.1)'
                ],
                'fill-opacity': 0.85
            }
        });
        map.addLayer({
            id: 'distritos-line',
            type: 'line',
            source: 'distritos',
            paint: { 'line-color': 'rgba(255,255,255,0.8)', 'line-width': 2, 'line-dasharray': [4, 3] }
        });
        map.addLayer({
            id: 'distritos-label',
            type: 'symbol',
            source: 'distritos',
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Bold'],
                'text-size': 13,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.1
            },
            paint: {
                'text-color': '#ffffff',
                'text-halo-color': 'rgba(0,0,0,0.8)',
                'text-halo-width': 2
            }
        });
    }

    // 3. POINTS, HEATMAP & CLUSTERS
    map.addSource('caries-points', { type: 'geojson', data: State.geojson });
    map.addSource('caries-heat', { type: 'geojson', data: State.geojson });
    map.addSource('caries-clusters', { type: 'geojson', data: State.geojson, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });
    map.addSource('measure', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

    // Heatmap
    map.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'caries-heat',
        maxzoom: 16,
        paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 15, 2],
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.15, 'rgba(232,93,38,0.08)', 0.35, 'rgba(232,93,38,0.25)', 0.55, 'rgba(255,122,69,0.45)', 0.75, 'rgba(255,170,110,0.65)', 1, 'rgba(255,220,180,0.9)'],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 25, 14, 40, 16, 55],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 14, 0.4, 16, 0]
        },
        layout: { visibility: 'none' }
    });

    // Points Glow layer removed per request

    // Points Core
    map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'caries-points',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3.5, 13, 6, 16, 10],
            'circle-color': ['match', ['get', 'status'], 'treating', '#F9A825', 'treated', '#34A853', '#E85D26'],
            'circle-opacity': 0.95,
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 2],
            'circle-stroke-color': 'rgba(255,255,255,0.6)'
        }
    });

    // Clusters (hidden by default)
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'caries-clusters',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': ['step', ['get', 'point_count'], '#E85D26', 10, '#C44A1A', 30, '#9A3515'],
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 32],
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255,255,255,0.4)'
        },
        layout: { visibility: 'none' }
    });
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'caries-clusters',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Bold'], 'text-size': 13, visibility: 'none' },
        paint: { 'text-color': '#ffffff' }
    });

    // Measure tool
    map.addLayer({ id: 'measure-fill', type: 'fill', source: 'measure', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': '#4AABB5', 'fill-opacity': 0.2 } });
    map.addLayer({ id: 'measure-line', type: 'line', source: 'measure', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#4AABB5', 'line-width': 3, 'line-dasharray': [3, 2] } });
    map.addLayer({ id: 'measure-pts', type: 'circle', source: 'measure', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 5, 'circle-color': '#4AABB5', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
}

function setupMapEvents() {
    const map = State.map;
    map.on('click', 'points', e => { if (!State.isMeasuring) openDetail(e.features[0]); });
    map.on('click', 'clusters', e => {
        const clusterId = e.features[0].properties.cluster_id;
        map.getSource('caries-clusters').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (!err) map.easeTo({ center: e.features[0].geometry.coordinates, zoom: zoom + 1, duration: 600 });
        });
    });
    ['points', 'clusters'].forEach(layer => {
        map.on('mouseenter', layer, () => { if (!State.isMeasuring) map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { if (!State.isMeasuring) map.getCanvas().style.cursor = ''; });
    });
}

function updateMapData() {
    const filtered = getFiltered();
    State.map.getSource('caries-points').setData(filtered);
    State.map.getSource('caries-heat').setData(filtered);
    State.map.getSource('caries-clusters').setData(filtered);
}

// ─── UI COMPONENTS ───────────────────────────────────

function setupSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { results.classList.add('hidden'); results.innerHTML = ''; return; }
        const matches = State.geojson.features
            .filter(f => (f.properties.ubicacion || '').toLowerCase().includes(q) || (f.properties.distrito || '').toLowerCase().includes(q) || String(f.properties.nro).includes(q))
            .slice(0, 10);
        if (!matches.length) { results.classList.add('hidden'); results.innerHTML = ''; return; }

        results.innerHTML = matches.map(f => `
            <div class="search-result-item" data-nro="${f.properties.nro}">
                <div>
                    <div><strong>#${f.properties.nro}</strong> — ${f.properties.ubicacion || 'Sin dirección'}</div>
                    <div class="result-district">${f.properties.distrito || ''}</div>
                </div>
            </div>
        `).join('');
        results.classList.remove('hidden');

        results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const feat = State.geojson.features.find(f => String(f.properties.nro) === item.dataset.nro);
                if (feat) { openDetail(feat); State.map.flyTo({ center: feat.geometry.coordinates, zoom: 16, duration: 1200 }); }
                results.classList.add('hidden'); input.value = '';
            });
        });
    });
    document.addEventListener('click', e => { if (!e.target.closest('#top-ui')) results.classList.add('hidden'); });
}

function setupStatusChips() {
    document.querySelectorAll('.quick-filters .chip[data-status]').forEach(c => {
        c.addEventListener('click', () => {
            const status = c.dataset.status;
            // Toggle off if already active
            if (State.activeStatus === status) {
                State.activeStatus = 'all';
                c.classList.remove('chip-active');
            } else {
                State.activeStatus = status;
                document.querySelectorAll('.quick-filters .chip[data-status]').forEach(x => x.classList.toggle('chip-active', x === c));
            }
            updateMapData(); updateStats();
        });
    });
}

function setupLayersModal() {
    // Base map
    document.querySelectorAll('input[name="base-map"]').forEach(radio => {
        radio.addEventListener('change', e => {
            const isSat = e.target.value === 'satellite';
            State.map.setLayoutProperty('satellite-layer', 'visibility', isSat ? 'visible' : 'none');
        });
    });

    // Checkboxes
    document.getElementById('layer-heatmap').addEventListener('change', e => {
        State.map.setLayoutProperty('heatmap', 'visibility', e.target.checked ? 'visible' : 'none');
    });
    document.getElementById('layer-clusters').addEventListener('change', e => {
        const isChecked = e.target.checked;
        const v = isChecked ? 'visible' : 'none';
        State.map.setLayoutProperty('clusters', 'visibility', v);
        State.map.setLayoutProperty('cluster-count', 'visibility', v);
        
        const ptsVis = isChecked ? 'none' : 'visible';
        State.map.setLayoutProperty('points', 'visibility', ptsVis);
    });
    document.getElementById('layer-districts').addEventListener('change', e => {
        const v = e.target.checked ? 'visible' : 'none';
        if (State.distritos) {
            State.map.setLayoutProperty('distritos-fill', 'visibility', v);
            State.map.setLayoutProperty('distritos-line', 'visibility', v);
            State.map.setLayoutProperty('distritos-label', 'visibility', v);
        }
    });
}

function setupFiltersModal() {
    const container = document.getElementById('district-checkboxes');
    if (!container) return;
    
    const districts = [...new Set(State.geojson.features.map(f => f.properties.distrito))].sort();
    State.activeDistricts = [...districts]; // All selected by default
    
    container.innerHTML = districts.map(d => `
        <label class="layer-option" style="margin-bottom: 6px;">
            <input type="checkbox" value="${d}" class="dist-check" checked>
            <span class="check-custom"></span>
            ${d}
        </label>
    `).join('');

    container.querySelectorAll('.dist-check').forEach(chk => {
        chk.addEventListener('change', () => {
            State.activeDistricts = Array.from(container.querySelectorAll('.dist-check:checked')).map(c => c.value);
            updateMapData(); 
            updateStats();
        });
    });
}

// ─── RIGHT SIDEBAR & FABs ──────────────────────────────
function setupSidebar() {
    document.getElementById('fab-layers').addEventListener('click', () => openModal('modal-layers'));
    document.getElementById('fab-participate').addEventListener('click', () => openModal('modal-participate'));
    document.getElementById('fab-info').addEventListener('click', () => openModal('modal-info'));

    // Measure FAB
    const btnMeasure = document.getElementById('fab-measure');
    btnMeasure.addEventListener('click', (e) => {
        e.stopPropagation();
        State.isMeasuring = !State.isMeasuring;
        btnMeasure.classList.toggle('active', State.isMeasuring);
        const bar = document.getElementById('measure-bar');
        const mapEl = document.getElementById('map');

        if (State.isMeasuring) {
            bar.classList.remove('hidden'); mapEl.classList.add('measure-cursor');
            document.getElementById('measure-text').textContent = 'Clic en el mapa para medir';
            State.measurePts = []; State.measureFinished = false; updateMeasure();
            State.map.on('click', handleMeasureClick);
        } else {
            bar.classList.add('hidden'); mapEl.classList.remove('measure-cursor');
            State.map.off('click', handleMeasureClick);
            clearMeasure();
        }
    });
    document.getElementById('measure-clear').addEventListener('click', clearMeasure);
    document.getElementById('measure-finish').addEventListener('click', () => {
        if (State.measurePts.length >= 3) {
            State.measureFinished = true;
            updateMeasure();
            // Update text to show final area/distance
            const area = turf.area(turf.polygon([[...State.measurePts, State.measurePts[0]]]));
            const areaText = area >= 10000 ? `${(area / 10000).toFixed(2)} ha` : `${area.toFixed(1)} m²`;
            document.getElementById('measure-text').textContent = `✅ Área: ${areaText}`;
        } else if (State.measurePts.length === 2) {
            State.measureFinished = true;
            updateMeasure();
            const dist = turf.length(turf.lineString(State.measurePts), { units: 'meters' });
            const distText = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
            document.getElementById('measure-text').textContent = `✅ Distancia: ${distText}`;
        }
    });

    // Bottom Stats Pill
    document.getElementById('btn-open-stats').addEventListener('click', () => { updateStats(); openModal('modal-stats'); });
}

// ─── MEASURE LOGIC ───────────────────────────────────
function handleMeasureClick(e) {
    if (!State.isMeasuring || State.measureFinished) return;
    State.measurePts.push([e.lngLat.lng, e.lngLat.lat]);
    updateMeasure(); updateMeasureText();
}
function updateMeasure() {
    const feats = [];
    State.measurePts.forEach(c => feats.push({ type: 'Feature', geometry: { type: 'Point', coordinates: c } }));
    
    let lineCoords = [...State.measurePts];
    if (State.measureFinished && State.measurePts.length >= 3) {
        lineCoords.push(State.measurePts[0]);
    }
    if (lineCoords.length >= 2) {
        feats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: lineCoords } });
    }
    if (State.measurePts.length >= 3) {
        feats.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...State.measurePts, State.measurePts[0]]] } });
    }
    State.map.getSource('measure').setData({ type: 'FeatureCollection', features: feats });
}
function updateMeasureText() {
    if (State.measureFinished) return;
    const el = document.getElementById('measure-text');
    if (State.measurePts.length < 2) { el.textContent = `${State.measurePts.length} punto(s) — clic para agregar`; return; }
    const dist = turf.length(turf.lineString(State.measurePts), { units: 'meters' });
    let text = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
    if (State.measurePts.length >= 3) {
        const area = turf.area(turf.polygon([[...State.measurePts, State.measurePts[0]]]));
        text += area >= 10000 ? ` · ${(area / 10000).toFixed(2)} ha` : ` · ${area.toFixed(1)} m²`;
    }
    el.textContent = `📏 ${text} (${State.measurePts.length} vértices)`;
}
function clearMeasure() {
    State.measurePts = []; 
    State.measureFinished = false;
    updateMeasure();
    document.getElementById('measure-text').textContent = 'Clic en el mapa para medir';
}

// ─── FEATURE DETAIL ──────────────────────────────────
let currentPopup = null;

function openDetail(feat) {
    const p = feat.properties;
    const detailEl = document.getElementById('feature-detail');
    
    document.getElementById('detail-badge').textContent = `LOTE #${p.nro || '—'}`;
    document.getElementById('detail-title').textContent = p.ubicacion || 'Sin dirección';
    document.getElementById('detail-address').textContent = p.ubicacion || '—';
    document.getElementById('detail-district').textContent = p.distrito || '—';
    document.getElementById('detail-zone').textContent = `Zona ${p.zonainmob || '—'}`;
    document.getElementById('detail-id').textContent = `#${p.nro || '—'}`;
    document.getElementById('detail-btn-fly').onclick = () => State.map.flyTo({ center: feat.geometry.coordinates, zoom: 17, duration: 1000 });
    
    const imgContainer = document.getElementById('detail-image-container');
    const imgElement = document.getElementById('detail-image');
    if (String(p.nro) === '174') {
        imgElement.src = 'image/imagendejemplo.png';
        imgContainer.style.display = 'block';
    } else {
        imgElement.src = '';
        imgContainer.style.display = 'none';
    }
    
    if (window.innerWidth > 768) {
        // PC: Mostrar como popup en el mapa
        if (currentPopup) currentPopup.remove();
        
        detailEl.classList.remove('hidden');
        document.getElementById('detail-close').style.display = 'none';
        
        currentPopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '340px', offset: 15 })
            .setLngLat(feat.geometry.coordinates)
            .setDOMContent(detailEl)
            .addTo(State.map);
            
        currentPopup.on('close', () => {
            clearHighlight();
            document.body.appendChild(detailEl);
            detailEl.classList.add('hidden');
        });
    } else {
        // Mobile: Mostrar como bottom sheet
        document.body.appendChild(detailEl);
        document.getElementById('detail-close').style.display = 'flex';
        detailEl.classList.remove('hidden');
    }
    
    setHighlight(feat.geometry.coordinates);
}

function closeDetail() {
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    } else {
        document.getElementById('feature-detail').classList.add('hidden');
        clearHighlight();
    }
}
document.getElementById('detail-close').addEventListener('click', closeDetail);

function setHighlight(coords) {
    clearHighlight();
    State.map.addSource('highlight', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: coords } } });
    State.map.addLayer({ id: 'highlight-ring', type: 'circle', source: 'highlight', paint: { 'circle-radius': 18, 'circle-color': 'transparent', 'circle-stroke-width': 3, 'circle-stroke-color': '#fff', 'circle-stroke-opacity': 0.9 } });
}
function clearHighlight() {
    if (State.map.getLayer('highlight-ring')) { State.map.removeLayer('highlight-ring'); State.map.removeSource('highlight'); }
}

// ─── STATS & MODALS ──────────────────────────────────
function updateStats() {
    const features = getFiltered().features;
    const dc = {}; features.forEach(f => { dc[f.properties.distrito] = (dc[f.properties.distrito] || 0) + 1; });
    const rouCounts = {}; features.forEach(f => { rouCounts[f.properties.rou] = (rouCounts[f.properties.rou] || 0) + 1; });
    
    let maxD = '—', maxC = 0; for (const [d, c] of Object.entries(dc)) { if (c > maxC) { maxC = c; maxD = d; } }
    
    animateNum(document.getElementById('stat-total'), features.length);
    animateNum(document.getElementById('stat-districts'), new Set(features.map(f => f.properties.distrito)).size);
    animateNum(document.getElementById('stat-zones'), new Set(features.map(f => f.properties.zonainmob)).size);
    document.getElementById('stat-critical').textContent = maxD;

    // District Chart
    const sortedD = Object.entries(dc).sort((a, b) => b[1] - a[1]);
    const maxDVal = sortedD[0] ? sortedD[0][1] : 1;
    document.getElementById('district-chart').innerHTML = sortedD.map(([name, count]) => `
        <div class="chart-row">
            <span class="chart-label-name">${name.toLowerCase()}</span>
            <div class="chart-bar-bg"><div class="chart-bar" style="width:${Math.round((count/maxDVal)*100)}%"></div></div>
            <span class="chart-count">${count}</span>
        </div>`).join('');

    // ROU Chart
    const sortedR = Object.entries(rouCounts).sort((a, b) => b[1] - a[1]);
    const maxRVal = sortedR[0] ? sortedR[0][1] : 1;
    document.getElementById('rou-chart').innerHTML = sortedR.map(([name, count]) => `
        <div class="chart-row">
            <span class="chart-label-name" style="min-width: 50px;">${name}</span>
            <div class="chart-bar-bg"><div class="chart-bar" style="background:var(--orange-status); width:${Math.round((count/maxRVal)*100)}%"></div></div>
            <span class="chart-count">${count}</span>
        </div>`).join('');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden')));
document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', () => ov.closest('.modal').classList.add('hidden')));

// ─── CAROUSEL ────────────────────────────────────────
function setupCarousel() {
    const slides = document.querySelectorAll('#info-carousel .carousel-slide');
    State.carouselTotal = slides.length;
    const dotsEl = document.getElementById('carousel-dots');
    dotsEl.innerHTML = Array.from({ length: State.carouselTotal }, (_, i) => `<div class="carousel-dot ${i===0?'active':''}" data-idx="${i}"></div>`).join('');

    function goTo(idx) {
        State.carouselIndex = ((idx % State.carouselTotal) + State.carouselTotal) % State.carouselTotal;
        slides.forEach((s, i) => s.classList.toggle('active', i === State.carouselIndex));
        dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === State.carouselIndex));
    }
    document.getElementById('carousel-prev').addEventListener('click', () => goTo(State.carouselIndex - 1));
    document.getElementById('carousel-next').addEventListener('click', () => goTo(State.carouselIndex + 1));
    dotsEl.querySelectorAll('.carousel-dot').forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.idx))));
}

// ─── ONBOARDING TOUR ──────────────────────────────────
function initTour() {
    if (localStorage.getItem('caries_tour_done')) return;
    
    // Slight delay after loading screen disappears
    setTimeout(() => {
        const modal = document.getElementById('onboarding-tour');
        if (!modal) return;
        modal.classList.remove('hidden');
        
        const steps = [
            { el: '#fab-layers', text: '1. Aquí puedes cambiar el mapa base, encender los clusters y filtrar por Distrito.' },
            { el: '#fab-participate', text: '2. ¡Sumate! Ayudanos a relevar información sobre caries urbanas en tu barrio.' },
            { el: '#bottom-bar-container', text: '3. En este panel inferior verás las estadísticas generales y gráficos detallados del observatorio.' },
            { el: '.quick-filters', text: '4. Filtra rápidamente por los estados de tratamiento de cada lote.' }
        ];
        
        let currentStep = -1;
        const startBtn = document.getElementById('tour-start');
        const nextBtn = document.getElementById('tour-next');
        const highlightBox = document.getElementById('tour-highlight-box');
        const tooltip = document.getElementById('tour-step-tooltip');
        const card = modal.querySelector('.tour-card');
        
        function positionHighlight(elSelector) {
            const el = document.querySelector(elSelector);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            highlightBox.style.display = 'block';
            highlightBox.style.top = (rect.top - 8) + 'px';
            highlightBox.style.left = (rect.left - 8) + 'px';
            highlightBox.style.width = (rect.width + 16) + 'px';
            highlightBox.style.height = (rect.height + 16) + 'px';
            
            tooltip.style.display = 'block';
            if (rect.top > window.innerHeight / 2) {
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 24) + 'px';
            } else {
                tooltip.style.top = (rect.bottom + 24) + 'px';
            }
            
            let left = rect.left + (rect.width / 2) - 130;
            if (left < 10) left = 10;
            if (left + 260 > window.innerWidth) left = window.innerWidth - 270;
            tooltip.style.left = left + 'px';
        }
        
        function showStep(idx) {
            if (idx >= steps.length) {
                modal.classList.add('hidden');
                localStorage.setItem('caries_tour_done', 'true');
                return;
            }
            currentStep = idx;
            card.style.display = 'none';
            document.getElementById('tour-step-text').textContent = steps[idx].text;
            document.getElementById('tour-step-count').textContent = `${idx + 1}/${steps.length}`;
            if (idx === steps.length - 1) nextBtn.textContent = 'Finalizar';
            positionHighlight(steps[idx].el);
        }
        
        startBtn.addEventListener('click', () => {
            document.getElementById('tour-overlay').style.background = 'transparent';
            showStep(0);
        });
        
        nextBtn.addEventListener('click', () => showStep(currentStep + 1));
        
    }, 1200);
}

// ─── INIT ────────────────────────────────────────────
function animateLoader(progress) {
    const fill = document.getElementById('loader-bar-fill');
    if (fill) fill.style.width = progress + '%';
}

async function init() {
    try {
        animateLoader(15);
        await initMap();
        animateLoader(40);
        await loadData();
        animateLoader(70);

        addSourcesAndLayers();
        setupMapEvents();
        animateLoader(85);

        setupSearch();
        setupStatusChips();
        setupLayersModal();
        setupFiltersModal();
        setupSidebar();
        setupCarousel();

        animateLoader(100);
        setTimeout(() => {
            const loader = document.getElementById('loading-screen');
            if (typeof gsap !== 'undefined') gsap.to(loader, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => loader.remove() });
            else { loader.classList.add('done'); setTimeout(() => loader.remove(), 600); }
            
            // Enter animation
            if (typeof gsap !== 'undefined') {
                gsap.fromTo('#top-ui', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
                gsap.fromTo('#bottom-bar-container', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' });
            }
            
            initTour();
        }, 600);
    } catch (err) { console.error('Error:', err); }
}

document.addEventListener('DOMContentLoaded', init);
