import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { renderRichText } from '../lib/richText.js';
import { NewsCard } from './News.jsx';

export default function DeanPage() {
  const [page, setPage] = useState(null);
  const [activities, setActivities] = useState([]);

  usePageMeta('كلمة عميد المعهد', 'كلمة عميد المعهد الوطني للعلوم الإدارية وأنشطته.');

  useEffect(() => {
    api.get('/public/pages/dean').then(setPage).catch(() => {});
    api
      .get('/public/news?limit=3')
      .then((all) => setActivities((all ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? 'كلمة عميد المعهد'}</h1>

        {page?.primary_image && (
          <img className="about-hero-image" src={page.primary_image} alt={page.title_ar ?? 'عميد المعهد'} />
        )}

        {page?.content_ar ? (
          <article
            className="about-content"
            dangerouslySetInnerHTML={{ __html: renderRichText(page.content_ar) }}
          />
        ) : (
          <p className="muted">لم تُنشر كلمة العميد بعد.</p>
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
