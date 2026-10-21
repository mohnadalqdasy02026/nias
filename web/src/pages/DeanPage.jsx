import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { renderRichText } from '../lib/richText.js';
import { NewsCard } from './News.jsx';

export default function DeanPage() {
  const [page, setPage] = useState(null);
  const [hq, setHq] = useState(null);
  const [activities, setActivities] = useState([]);

  usePageMeta('كلمة عميد المعهد', 'كلمة عميد المعهد الوطني للعلوم الإدارية وأنشطته.');

  useEffect(() => {
    api.get('/public/pages/dean').then(setPage).catch(() => {});
    // The dean's word speaks for the whole institute, so the headquarters
    // branch message is used when the standalone page has no content yet.
    api
      .get('/public/branches')
      .then((list) => setHq((list ?? []).find((b) => b.is_headquarters) ?? null))
      .catch(() => {});
    api
      .get('/public/news?limit=3')
      .then((all) => setActivities((all ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const content = page?.content_ar || hq?.dean_message_ar;
  const image = page?.primary_image || hq?.dean_image;

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? 'كلمة عميد المعهد'}</h1>

        {image && (
          <img className="about-hero-image" src={image} alt={page?.title_ar ?? 'عميد المعهد'} />
        )}

        {content ? (
          <article
            className="about-content"
            dangerouslySetInnerHTML={{ __html: renderRichText(content) }}
          />
        ) : (
          <p className="muted">لم تُنشر كلمة العميد بعد.</p>
        )}

        {hq?.dean_name_ar && (
          <p className="muted" style={{ marginTop: 16 }}>
            {hq.dean_name_ar} — عميد المعهد الوطني للعلوم الإدارية
          </p>
        )}

        {activities.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: 48 }}>أنشطة العميد</h2>
            <div className="news-grid">
              {activities.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
