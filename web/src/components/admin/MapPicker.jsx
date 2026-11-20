import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default view when the record has no coordinates yet — same values used
// as the placeholders of the latitude/longitude inputs.
const DEFAULT_VIEW = { lat: 15.3694, lng: 44.2011, zoom: 6 };

// Custom pin (divIcon) so we don't depend on Leaflet's bundled image assets,
// which break their paths when bundled by Vite.
const pinIcon = L.divIcon({
  className: 'map-picker-pin',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

// Tile providers in order: first our own same-origin proxy (/tiles/… — the
// server fetches from CARTO then OpenStreetMap), then the providers
// directly as last resorts. All three must be allowed by the CSP img-src
// header (see server/src/app.js).
const TILE_SOURCES = [
  {
    url: '/tiles/{z}/{x}/{y}',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
];

// Empty strings must NOT become 0 (Number('') === 0 would open the map in
// the middle of the ocean); out-of-range values are rejected too.
const parseCoord = (v, min, max) => {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const round6 = (n) => String(Number(n.toFixed(6)));

/**
 * Modal map (OpenStreetMap/Leaflet, no API key) used to pick coordinates
 * instead of typing them: click (or drag) the marker, then press «موافق».
 *
 * Props:
 *  - open: boolean
 *  - initial: { lat, lng } — existing values, used to centre + pre-place the pin
 *  - onConfirm(lat: string, lng: string)
 *  - onClose()
 */
export default function MapPicker({ open, initial = {}, onConfirm, onClose }) {
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const [picked, setPicked] = useState(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    if (!open || !containerRef.current) return undefined;

    setTilesFailed(false);
    setInitError(null);

    const startLat = parseCoord(initial?.lat, -90, 90);
    const startLng = parseCoord(initial?.lng, -180, 180);
    const start = startLat != null && startLng != null ? { lat: startLat, lng: startLng } : null;
    const center = start ?? DEFAULT_VIEW;

    // `disposed` guards the async Leaflet callbacks: once the dialog closes
    // (map removed) a late tile event must not touch the dead map or set
    // state on an unmounted tree.
    let map = null;
    let disposed = false;

    // Tile layers with automatic provider fallback: after a few consecutive
    // errors we switch source once; if both fail we tell the user instead
    // of silently showing a blank area.
    let sourceIndex = 0;
    let errorStreak = 0;
    let layer = null;

    const attachLayer = () => {
      const src = TILE_SOURCES[sourceIndex];
      layer = L.tileLayer(src.url, {
        maxZoom: 19,
        attribution: src.attribution,
        // Leaflet reads subdomains.length for EVERY tile URL — even when the
        // template has no {s} — so it must never be undefined (that crashed
        // the whole admin page via ErrorBoundary on this deployment).
        subdomains: src.subdomains ?? 'abc',
      });
      layer.on('tileload', () => {
        if (disposed) return;
        errorStreak = 0;
        setTilesFailed(false);
      });
      layer.on('tileerror', () => {
        if (disposed) return;
        errorStreak += 1;
        if (errorStreak < 4) return;
        if (sourceIndex < TILE_SOURCES.length - 1) {
          sourceIndex += 1;
          errorStreak = 0;
          map.removeLayer(layer);
          attachLayer();
        } else {
          setTilesFailed(true);
        }
      });
      layer.addTo(map);
    };

    const placeMarker = (lat, lng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          if (disposed || !markerRef.current) return;
          const p = markerRef.current.getLatLng();
          setPicked({ lat: p.lat, lng: p.lng });
        });
      }
      setPicked({ lat, lng });
    };

    const onMapClick = (e) => placeMarker(e.latlng.lat, e.latlng.lng);

    try {
      map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: start ? 14 : DEFAULT_VIEW.zoom,
      });

      attachLayer();

      if (start) placeMarker(start.lat, start.lng);
      else setPicked(null);

      map.on('click', onMapClick);
      map.whenReady(() => {
        if (!disposed) map.invalidateSize();
      });
    } catch (e) {
      // A map failure must never take the whole page down: keep the dialog
      // open and explain what happened instead.
      console.error('[MapPicker] failed to initialise', e);
      setInitError(
        'تعذّر تشغيل الخريطة في هذا المتصفح. يمكنك إدخال خط الطول وخط العرض يدويًا في الحقول بالأعلى.',
      );
      if (map) {
        try {
          map.remove();
        } catch {
          /* already destroyed — ignore */
        }
      }
      markerRef.current = null;
      return undefined;
    }

    return () => {
      disposed = true;
      map.off('click', onMapClick);
      map.remove();
      markerRef.current = null;
    };
    // Re-initialise only when the modal opens; `initial` is read fresh each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const confirm = () => {
    if (!picked) return;
    onConfirm?.(round6(picked.lat), round6(picked.lng));
  };

  return (
    <div className="map-picker-overlay" role="presentation" onClick={onClose}>
      <div
        className="map-picker"
        role="dialog"
        aria-modal="true"
        aria-label="اختيار الموقع من الخريطة"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="map-picker-head">
          <strong>اختيار الموقع من الخريطة</strong>
          <span>اضغط على الخريطة لتحديد موقع الفرع، ويمكنك سحب العلامة لضبط الموضع ثم اضغط «موافق».</span>
        </div>

        <div className="map-picker-canvas-wrap">
          <div className="map-picker-canvas" ref={containerRef} dir="ltr" />
          {(initError || tilesFailed) && (
            <div className="map-picker-tiles-error" role="alert">
              {initError ??
                'تعذّر تحميل صور الخريطة. تحقق من اتصال الإنترنت ثم أعد فتح هذه النافذة.'}
            </div>
          )}
        </div>

        <div className="map-picker-foot">
          <span className="map-picker-coords" dir="ltr">
            {picked
              ? `خط العرض ${round6(picked.lat)} — خط الطول ${round6(picked.lng)}`
              : 'لم يتم تحديد موقع بعد'}
          </span>
          <div className="map-picker-actions">
            <button type="button" className="btn btn-primary" disabled={!picked} onClick={confirm}>
              موافق
            </button>
            <button type="button" className="btn btn-soft" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
