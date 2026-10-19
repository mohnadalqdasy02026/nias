import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function JournalPage() {
  const [issues, setIssues] = useState([]);
  const [articles, setArticles] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState(null);

  usePageMeta('المجلة العلمية', 'مجلة العلوم الإدارية الصادرة عن المعهد الوطني للعلوم الإدارية — أعداد المجلة والبحوث المنشورة.');

  useEffect(() => {
    Promise.all([
      api.get('/public/journal/issues'),
      api.get('/public/journal/articles'),
    ])
      .then(([iss, arts]) => {
        setIssues(iss ?? []);
        setArticles(arts ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  const byIssue = useMemo(() => {
    const map = new Map();
    for (const a of articles) {
      const list = map.get(a.issue_id) ?? [];
      list.push(a);
      map.set(a.issue_id, list);
    }
    return map;
  }, [articles]);

  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">الإصدار العلمي</p>
          <h1>مجلة العلوم الإدارية</h1>
          <p className="subpage-sub">أعداد المجلة والبحوث المنشورة صادرة عن المعهد الوطني للعلوم الإدارية.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {issues.length === 0 && !error && <p className="muted admin-empty">لم يُنشر أي عدد من المجلة بعد.</p>}

          <div className="downloads-list">
            {issues.map((issue) => {
              const arts = byIssue.get(issue.id) ?? [];
              const isOpen = openId === issue.id;
              return (
                <div key={issue.id} className="card download-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {issue.cover && (
                    <img
                      src={issue.cover}
                      alt={issue.title}
                      style={{ width: 72, height: 96, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                  <div className="download-info" style={{ flex: 1, minWidth: 200 }}>
                    <strong>{issue.title}</strong>
                    <span className="download-cat">
                      {issue.issue_number ? `العدد ${issue.issue_number}` : ''}
                      {issue.issue_number && issue.published_at ? ' · ' : ''}
                      {issue.published_at ? formatDate(issue.published_at) : ''}
                    </span>
                    {arts.length > 0 && (
                      <div style={{ marginTop: isOpen ? 10 : 0 }}>
                        <button
                          type="button"
                          className="btn btn-soft btn-sm"
                          onClick={() => setOpenId(isOpen ? null : issue.id)}
                        >
                          {isOpen ? 'إخفاء محتويات العدد' : `محتويات العدد (${arts.length})`}
                        </button>
                        {isOpen && (
                          <ul style={{ margin: '10px 0 0', paddingRight: 20 }}>
                            {arts.map((a) => (
                              <li key={a.id} style={{ marginBottom: 6 }}>
                                {a.file_path ? (
                                  <a href={a.file_path} target="_blank" rel="noopener noreferrer">{a.title_ar}</a>
                                ) : (
                                  a.title_ar
                                )}
                                {a.author_name_ar ? (
                                  <span className="muted"> — {a.author_name_ar}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="download-side">
                    {issue.file_path && (
                      <a href={issue.file_path} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                        قراءة / تحميل العدد
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
