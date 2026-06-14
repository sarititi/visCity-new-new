import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: 31.7683, lng: 35.2137 }; // ירושלים - מרכז ברירת מחדל
const LOAD_TIMEOUT_MS = 6000;

export default function PlaceLocationPicker({ latitude, longitude, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [ready, setReady] = useState(false);
  const [mapsError, setMapsError] = useState(() => Boolean(window.__GMAPS_AUTH_FAILED__));

  // מאזינים לכשל אימות/הרשאות גלובלי של Google Maps (לדוגמה: Billing not enabled)
  useEffect(() => {
    if (window.__GMAPS_AUTH_FAILED__) {
      setMapsError(true);
      return;
    }
    const handleAuthFailure = () => setMapsError(true);
    window.addEventListener('gmaps-auth-failure', handleAuthFailure);
    return () => window.removeEventListener('gmaps-auth-failure', handleAuthFailure);
  }, []);

  // מחכים שסקריפט Google Maps + Places יסיים להיטען (עם טיים-אאוט להגנה)
  useEffect(() => {
    if (mapsError) return;

    if (window.google?.maps?.places) {
      setReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.__GMAPS_AUTH_FAILED__) {
        clearInterval(interval);
        setMapsError(true);
        return;
      }
      if (window.google?.maps?.places) {
        clearInterval(interval);
        setReady(true);
      }
    }, 200);

    // אם גוגל מפות לא נטען בכלל בזמן סביר (חיבור חסום, מפתח לא תקין וכו') —
    // לא נשאיר את הטופס "תקוע" בלי דרך להזין מיקום.
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.google?.maps?.places) setMapsError(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mapsError]);

  useEffect(() => {
    if (!ready || mapsError) return;

    const hasInitialPosition = latitude != null && longitude != null;
    const initialPosition = hasInitialPosition
      ? { lat: Number(latitude), lng: Number(longitude) }
      : DEFAULT_CENTER;

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: hasInitialPosition ? 14 : 7,
      gestureHandling: 'cooperative', // כדי שגלילה בתוך המודאל לא "תיתפס" ע"י המפה
    });
    mapInstance.current = map;

    const marker = new window.google.maps.Marker({
      position: initialPosition,
      map,
      draggable: true,
    });
    markerInstance.current = marker;

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      onChange({ latitude: pos.lat(), longitude: pos.lng(), google_place_id: null });
    });

    map.addListener('click', (e) => {
      marker.setPosition(e.latLng);
      onChange({ latitude: e.latLng.lat(), longitude: e.latLng.lng(), google_place_id: null });
    });

    // שומרים אילו .pac-container קיימים כבר ב-body, כדי לזהות את החדש שייווצר
    const existingPacContainers = new Set(document.querySelectorAll('.pac-container'));

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'place_id', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return;

      map.setCenter(location);
      map.setZoom(15);
      marker.setPosition(location);

      onChange({
        latitude: location.lat(),
        longitude: location.lng(),
        google_place_id: place.place_id || null,
      });
    });

    // ה-Autocomplete מוסיף תפריט הצעות (.pac-container) ישירות ל-body
    let pacContainer = null;
    document.querySelectorAll('.pac-container').forEach((el) => {
      if (!existingPacContainers.has(el)) pacContainer = el;
    });

    // ניקוי בעת unmount / רינדור חוזר (כדי שלא ייווצרו כמה מפות/Autocomplete כפולים)
    return () => {
      window.google.maps.event.clearInstanceListeners(map);
      window.google.maps.event.clearInstanceListeners(marker);
      window.google.maps.event.clearInstanceListeners(autocomplete);
      marker.setMap(null);
      pacContainer?.remove();
    };
  }, [ready, mapsError]);

  // כאשר המפה זזה ע"י לחיצה/גרירה, ה-marker וה-map מתעדכנים ישירות ע"י Google API
  // (לא דרך re-render). כשעוברים למצב הזנה ידנית נשמור את אותה לוגיקה.
  useEffect(() => {
    if (!mapInstance.current || !markerInstance.current) return;
    if (latitude == null || longitude == null) return;

    const pos = { lat: Number(latitude), lng: Number(longitude) };
    markerInstance.current.setPosition(pos);
    mapInstance.current.setCenter(pos);
  }, [latitude, longitude]);

  const handleManualChange = (field, value) => {
    const num = value.trim() === '' ? null : Number(value);
    if (value.trim() !== '' && Number.isNaN(num)) return;

    onChange({
      latitude: field === 'latitude' ? num : (latitude != null ? Number(latitude) : null),
      longitude: field === 'longitude' ? num : (longitude != null ? Number(longitude) : null),
      google_place_id: null,
    });
  };

  return (
    <div className="form-group">
      <label className="form-label">מיקום</label>

      {mapsError ? (
        <div className="location-picker-fallback">
          <p>
            ⚠️ לא ניתן לטעון את Google Maps כרגע (יתכן ויש בעיה בהגדרות חיוב/מפתח ה-API).
            אפשר להזין את המיקום ידנית באמצעות קואורדינטות:
          </p>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="חפשו כתובת או מקום בגוגל מפות..."
          />
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '250px',
              borderRadius: '12px',
              marginTop: '8px',
            }}
          />
        </>
      )}

      <div className="location-manual-inputs">
        <div className="location-manual-field">
          <label className="form-label">קו רוחב (Latitude)</label>
          <input
            type="number"
            step="any"
            className="form-input"
            placeholder="לדוגמה: 31.7683"
            value={latitude ?? ''}
            onChange={(e) => handleManualChange('latitude', e.target.value)}
          />
        </div>
        <div className="location-manual-field">
          <label className="form-label">קו אורך (Longitude)</label>
          <input
            type="number"
            step="any"
            className="form-input"
            placeholder="לדוגמה: 35.2137"
            value={longitude ?? ''}
            onChange={(e) => handleManualChange('longitude', e.target.value)}
          />
        </div>
      </div>

      {latitude != null && longitude != null && (
        <small style={{ color: 'var(--places-text-muted)' }}>
          📍 {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
        </small>
      )}
    </div>
  );
}