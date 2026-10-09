import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const TYPE_LABEL = {
  news: 'الأخبار',
  program: 'البرامج الأكاديمية',
  page: 'الصفحات',
};
const TYPE_PATH = { news: '/news/', program: '/programs/', page: '/pages/' };

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  usePageMeta(
    q ? `البحث: ${q}` : 'البحث في الموقع',
    'ابحث في أخبار وبرامج وصفحات المعهد الوطني للعلوم الإدارية.',
  );

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    api.get(`/public/search?q=${encodeURIComponent(q)}`)
      .then(setResults)
      .catch((e) => setError(e.message ?? 'تعذّر إتمام البحث'))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">نتائج البحث</h1>
        <form action="/search" method="get" className="search-page-form" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ابحث في الأخبار والبرامج والصفحات..."
            aria-label="كلمة البحث"
          />
          <button type="submit" className="btn btn-primary">بحث</button>
        </form>

        {loading && <p className="muted">جارٍ البحث...</p>}
        {!loading && error && <div className="alert alert-danger" role="alert">{error}</div>}
        {!loading && !error && q.length < 2 && (
          <p className="muted">أدخل حرفين على الأقل للبحث.</p>
        )}
        {!loading && !error && q.length >= 2 && (
          <>
            <p className="muted">
              {results.length === 0 ? 'لا توجد نتائج مطابقة.' : `عدد النتائج: ${results.length}`}
            </p>
            <div className="search-results">
              {results.map((r) => (
                <article key={`${r.type}-${r.id}`} className="card search-result">
                  <span className={`news-type-badge search-result-type`}>{TYPE_LABEL[r.type] ?? r.type}</span>
                  <Link to={`${TYPE_PATH[r.type] ?? '/'}${r.id}`} className="search-result-link">
                    {r.title}
                  </Link>
                  {r.snippet && <p className="search-result-snippet">{r.snippet}</p>}
                  {r.meta?.publishedAt && (
                    <span className="muted meta-date">{new Date(r.meta.publishedAt).toLocaleDateString('ar-YE')}</span>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}