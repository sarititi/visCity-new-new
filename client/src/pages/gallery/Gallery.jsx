import { useEffect, useState } from 'react';
import { getPlaces } from '../../API/placeAPI';
import GalleryGrid from '../../components/gallery/GalleryGrid';
import '../../styles/gallery.css';

const BASE_URL = 'http://localhost:3000';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const placesRes = await getPlaces({ page: 1, limit: 12 });
        const places = placesRes.places || [];

        const allMedia = [];
        await Promise.all(
          places.map(async (p) => {
            try {
              const res = await fetch(`${BASE_URL}/places/${p.place_id}/media`);
              if (!res.ok) return;
              const items = await res.json();
              items.forEach((it) => allMedia.push({ ...it, placeId: p.place_id }));
            } catch (e) {
              // התעלמות משגיאות במקום בודד
            }
          })
        );

        setMedia(allMedia);
      } catch (err) {
        setMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="gallery-page">
      <h1 className="gallery-title">גלריית תמונות</h1>
      <p className="gallery-subtitle">תמונות ששותפו על ידי הקהילה שלנו • גלו השראה לטיול הבא שלכם</p>

      {loading ? (
        <div className="gallery-loading">
          <div className="places-spinner" />
          <span>טוען תמונות...</span>
        </div>
      ) : (
        <GalleryGrid media={media} />
      )}
    </div>
  );
}