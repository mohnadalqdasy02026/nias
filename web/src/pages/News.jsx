import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel, isHeadquartersName } from '../lib/branch.js';

const typeLabel = {
  news: 'خبر',
  event: 'فعالية',
  activity: 'نشاط',
  course: 'دورة',
};

function BranchTag({ item }) {
  if (!item.branch_name_ar) return null;
  const label = branchLabel(item.branch_name_ar);
  return (
    <Link
      to={`/branches/${item.branch_slug}`}
      className={`news-branch-tag${isHeadquartersName(label) ? ' is-hq' : ''}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
      {label}
    </Link>
  );
}

function NewsCover({ item }) {
  if (item.cover_image) {
    return <img className="news-cover" src={item.cover_image} alt={item.title_ar ?? item.title_en} loading="lazy" />;
  }
  return (
    <div className="news-cover news-cover--placeholder">
      <span className="news-cover-mark">NIAS</span>
      <span className={`news-type-badge news-type--${item.content_type}`}>{typeLabel[item.content_type] ?? 'خبر'}</span>
    </div>
  );
}

function NewsCard({ item, linkPrefix = '/news' }) {
  const type = typeLabel[item.content_type] ?? 'خبر';
  return (
    <article className="card news-card">
      <NewsCover item={item} />
      <div className="news-body">
        <span className={`news-type-badge news-type--${item.content_type}`}>{type}</span>
        <BranchTag item={item} />
        <h3>{item.title_ar ?? item.title_en}</h3>
        {item.summary_ar && <p>{item.summary_ar}</p>}
        <Link to={`${linkPrefix}/${item.id}`} className="news-link">اقرأ المزيد</Link>
      </div>
    </article>
  );
}

export function NewsList() {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 9;
  const [, setSearchParams] = useSearchParams();

  usePageMeta('الأخبار والفعاليات', 'مستجدات وأنشطة وفعاليات المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get(`/public/news?limit=50`).then((all) => {
      setTotal(all.length);
      setNews(all.slice(0, page * perPage));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchParams(page > 1 ? { page } : {}, { replace: true });
  }, [page, setSearchParams]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">الأخبار والفعاليات</h1>
        <p className="section-subtitle">مستجدات وأنشطة المعهد الوطني للعلوم الإدارية</p>
        <div className="news-grid">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
          {news.length === 0 && <p className="muted">لا توجد أخبار منشورة.</p>}
        </div>
        {total > perPage && (
          <div className="admin-pagination">
            <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</button>
            <span>صفحة {page} من {totalPages}</span>
            <button type="button" className="btn btn-sm btn-soft" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>التالي</button>
          </div>
        )}
      </div>
    </section>
  );
}

export function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(item ? (item.title_ar ?? item.title_en) : 'خبر');

  useEffect(() => {
    api
      .get(`/public/news/${id}`)
      .then(setItem)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <section className="section container"><p className="muted">الخبر غير موجود.</p></section>;
  if (!item) return <section className="section container"><p>جارٍ التحميل...</p></section>;

  return (
    <section className="section">
      <div className="container page-content">
        <span className={`news-type-badge news-type--${item.content_type}`}>{typeLabel[item.content_type] ?? 'خبر'}</span>
        <BranchTag item={item} />
        <h1 className="section-title">{item.title_ar ?? item.title_en}</h1>
        {item.published_at && <p className="muted meta-date">{new Date(item.published_at).toLocaleDateString('ar-YE')}</p>}
        {item.cover_image && <img className="news-detail-cover" src={item.cover_image} alt={item.title_ar ?? item.title_en} />}
        {item.summary_ar && <p className="lead">{item.summary_ar}</p>}
        {item.body_ar || item.body_en
          ? <div className="news-detail-body" dangerouslySetInnerHTML={{ __html: item.body_ar ?? item.body_en }} />
          : null}
        <Link to="/news" className="btn btn-outline back-link">← العودة للأخبار</Link>
      </div>
    </section>
  );
}