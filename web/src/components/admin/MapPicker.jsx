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

const parseNum = (v) => {
  const n = Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : null;
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

  useEffect(() => {
    if (!open || !containerRef.current) return undefined;

    const startLat = parseNum(initial?.lat);
    const startLng = parseNum(initial?.lng);
    const start = startLat != null && startLng != null ? { lat: startLat, lng: startLng } : null;
    const center = start ?? DEFAULT_VIEW;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: start ? 14 : DEFAULT_VIEW.zoom,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const placeMarker = (lat, lng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const p = markerRef.current.getLatLng();
          setPicked({ lat: p.lat, lng: p.lng });
        });
      }
      setPicked({ lat, lng });
    };

    if (start) placeMarker(start.lat, start.lng);
    else setPicked(null);

    const onMapClick = (e) => placeMarker(e.latlng.lat, e.latlng.lng);
    map.on('click', onMapClick);

    return () => {
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

        <div className="map-picker-canvas" ref={containerRef} dir="ltr" />

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
