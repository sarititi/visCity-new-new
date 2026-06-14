import { Link } from 'react-router-dom';

export default function GalleryGrid({ media }) {
  if (!media || media.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="empty-icon">📷</div>
        <p>עדיין אין תמונות בגלריה. היו הראשונים להוסיף!</p>
      </div>
    );
  }

  return (
    <div className="gallery-grid">
      {media.map((m) => {
        const mid = m.media_id || m.id;
        return (
          <Link
            to={`/gallery/${m.placeId}/${mid}`}
            className="gallery-item"
            key={`${m.placeId}-${mid}`}>
            <img src={m.media_url || m.url} alt={m.caption || m.uploaded_by || 'תמונה מהגלריה'} />
            {(m.uploaded_by || m.caption) && (
              <div className="gallery-item__info">
                <div className="gallery-item__uploader">
                  {m.uploaded_by ? `צולם על ידי ${m.uploaded_by}` : ''}
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}