import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { renderRichText } from '../lib/richText.js';

export default function DeanPage() {
  const [page, setPage] = useState(null);
  const [hq, setHq] = useState(null);

  usePageMeta('كلمة عميد المعهد', 'كلمة عميد المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get('/public/pages/dean').then(setPage).catch(() => {});
    // The dean's word speaks for the whole institute, so the headquarters
    // branch message is used when the standalone page has no content yet.
    api
      .get('/public/branches')
      .then((list) => setHq((list ?? []).find((b) => b.is_headquarters) ?? null))
      .catch(() => {});
  }, []);

  const content = page?.content_ar || hq?.dean_message_ar;
  const image = page?.primary_image || hq?.dean_image;

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? 'كلمة عميد المعهد'}</h1>

        {(image || hq?.dean_name_ar) && (
          <div className="dean-head">
            {image && (
              <img className="dean-photo" src={image} alt={hq?.dean_name_ar ?? 'عميد المعهد'} />
            )}
            {(hq?.dean_name_ar || hq?.dean_name) && (
              <div className="dean-head-info">
                <h2 className="dean-head-name">{hq.dean_name_ar ?? hq.dean_name}</h2>
                <span className="dean-head-role">عميد المعهد الوطني للعلوم الإدارية</span>
              </div>
            )}
          </div>
        )}

        {content ? (
          <article
            className="about-content"
            dangerouslySetInnerHTML={{ __html: renderRichText(content) }}
          />
        ) : (
          <p className="muted">لم تُنشر كلمة العميد بعد.</p>
        )}
      </div>
    </section>
  );
}
