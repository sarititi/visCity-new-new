import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { getMedia, uploadMedia } from '../../API/mediaAPI';

export default function PlaceMediaGrid({ placeId, initialMedia = [] }) {
  const { user } = useContext(UserContext);
  const [mediaList, setMediaList] = useState(initialMedia);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // טעינת המדיה הקיימת של המקום מהשרת
  useEffect(() => {
    let active = true;

    const fetchMedia = async () => {
      setLoading(true);
      try {
        const data = await getMedia(placeId);
        if (active) setMediaList(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError('שגיאה בטעינת המדיה. אנא נסו שוב.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (placeId) fetchMedia();
    return () => { active = false; };
  }, [placeId]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      setError('יש להתחבר כדי להעלות מדיה');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError('');

    try {
      // השרת מקבל קובץ אחד בכל בקשה (upload.single), כך שמעלים כל קובץ בנפרד
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const media = await uploadMedia(placeId, files[i], user.token);
        uploaded.push(media);
      }
      setMediaList((prev) => [...uploaded, ...prev]);
    } catch (err) {
      setError(err.message || 'העלאת הקבצים נכשלה');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <section className="place-media-section">
      <h3>גלריית תמונות מהמקום</h3>

      {user ? (
        <div className="media-upload-zone">
          <label htmlFor="media-file-input" className="btn-secondary">
            {uploading ? 'מעלה קבצים...' : 'הוסף תמונות'}
          </label>
          <input
            id="media-file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <p className="no-media-text">יש להתחבר כדי להעלות תמונות למקום זה.</p>
      )}

      {error && <p className="modal-error-message">{error}</p>}

      {loading ? (
        <p className="no-media-text">טוען מדיה...</p>
      ) : mediaList.length === 0 ? (
        <p className="no-media-text">אין עדיין תמונות עבור מקום זה. היו הראשונים לשתף!</p>
      ) : (
        <div className="media-gallery-grid">
          {mediaList.map((item) => (
            <div key={item.media_id} className="media-grid-item">
              {item.media_type === 'audio' ? (
                <audio src={item.media_url} controls />
              ) : (
                <img src={item.media_url} alt="מדיה מהאתר" loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
