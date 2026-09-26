import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchLabel, isHeadquartersName } from '../lib/branch.js';

const typeLabel = { news: 'خبر', event: 'فعالية', activity: 'نشاط', course: 'دورة' };
const decodeEntities = (s) =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');

function Cover({ item }) {
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

function NewsThumb({ item }) {
  return (
    <Link to={`/news/${item.id}`} className="card branch-news-card">
      <Cover item={item} />
      <div className="branch-news-body">
        <span className={`news-type-badge news-type--${item.content_type}`}>{typeLabel[item.content_type] ?? 'خبر'}</span>
        {item.branch_name_ar && (
          <span className={`news-branch-tag${isHeadquartersName(branchLabel(item.branch_name_ar)) ? ' is-hq' : ''}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
            {branchLabel(item.branch_name_ar)}
          </span>
        )}
        <h3>{item.title_ar ?? item.title_en}</h3>
        {item.summary_ar && <p>{item.summary_ar}</p>}
      </div>
    </Link>
  );
}

const TABS = [
  { key: 'dean', label: 'عميد الفرع' },
  { key: 'news', label: 'الأخبار' },
  { key: 'events', label: 'الفعاليات' },
  { key: 'courses', label: 'الدورات التدريبية' },
  { key: 'faculty', label: 'الكادر الأكاديمي' },
];

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="branches-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`programs-tab branches-tab${active === t.key ? ' programs-tab--active' : ''}`}
          onClick={() => onSelect(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function BranchesPage() {
  const { slug } = useParams();
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState(null);
  const [news, setNews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('dean');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const settings = useSiteSettings();
  const logo = settings?.general?.logo ?? '/uploads/design/site/logo.jpg';

  usePageMeta(
    slug ? `فرع المعهد — ${branchLabel(branch?.name_ar) ?? ''}` : 'فروع المعهد',
    'فروع المعهد الوطني للعلوم الإدارية وأخبارها وفعالياتها ودوراتها التدريبية.',
  );

  useEffect(() => {
    if (!slug) {
      api.get('/public/branches').then(setBranches).catch((e) => setError(e.message));
      return;
    }
    setTab('dean');
    api.get(`/public/branches/${slug}`)
      .then(async (b) => {
        setBranch(b);
        const [n, c, depts, fm] = await Promise.all([
          api.get(`/public/news?branchId=${b.id}&limit=50`).catch(() => []),
          api.get(`/public/training-courses?branchId=${b.id}`).catch(() => []),
          api.get('/public/departments').catch(() => []),
          api.get(`/public/faculty?branchId=${b.id}`).catch(() => []),
        ]);
        setNews(n ?? []);
        setCourses(c ?? []);
        const names = new Map((depts ?? []).map((d) => [String(d.id), d.name_ar]));
        setFaculty((fm ?? []).map((m) => ({
          ...m,
          department_name_ar: names.get(String(m.department_id)) ?? 'عام',
        })));
        setFacultyFilter('all');
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const hq = branch?.is_headquarters;
  const label = branchLabel(branch?.name_ar);
  const newsItems = news.filter((n) => n.content_type === 'news');
  const eventItems = news.filter((n) => n.content_type === 'event' || n.content_type === 'activity');

  return (
    <>
      <section className={`subpage-hero${slug ? ' subpage-hero--branch' : ''}`}>
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">شبكة الفروع</p>
          <h1>{slug ? (label ?? 'الفرع') : 'فروع المعهد'}</h1>
          <p className="subpage-sub">
            {slug
              ? 'عميد الفرع وأخباره وفعالياته والدورات التدريبية المعتمدة فيه.'
              : `يمتد المعهد الوطني للعلوم الإدارية عبر ${branches.length} فروع في محافظات الجمهورية، ليكون قربًا من طلابنا ومتدربينا أينما كانوا.`}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {!slug && branches.length === 0 && !error && <p className="muted admin-empty">لم تُسجل فروع بعد.</p>}

          {!slug && (
            <div className="branches-page-grid">
              {branches.map((b) => (
                <Link key={b.id} to={`/branches/${b.slug}`} className={`card branch-page-card${b.is_headquarters ? ' is-hq' : ''}`}>
                  <div className="branch-page-cover">
                    <img src={logo} alt={b.name_ar || 'المعهد الوطني للعلوم الإدارية'} loading="lazy" />
                  </div>
                  <div className="branch-page-body">
                    <span className="branch-page-city">{b.name_en ?? b.slug}</span>
                    <h2>{b.name_ar}</h2>
                    <span className={`branch-page-badge${b.is_headquarters ? ' branch-page-badge--hq' : ''}`}>
                      {b.is_headquarters ? 'المقر الرئيسي' : 'فرع'}
                    </span>
                    <div className="branch-page-details">
                      {b.address && (
                        <p><span aria-hidden="true">📍</span> {b.address}</p>
                      )}
                      <p>
                        <span aria-hidden="true">📞</span>{' '}
                        {b.phone ? <a href={`tel:${b.phone}`} dir="ltr">{b.phone}</a> : '—'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {slug && branch && (
            <>
              <article className={`card branch-detail-card${hq ? ' is-hq' : ''}`}>
                <div className="branch-detail-cover">
                  <img src={logo} alt={branch.name_ar || 'المعهد الوطني للعلوم الإدارية'} />
                </div>
                <div className="branch-detail-body">
                  <span className="branch-page-city">{branch.name_en ?? branch.slug}</span>
                  <h2>{branch.name_ar}</h2>
                  <span className={`branch-page-badge${hq ? ' branch-page-badge--hq' : ''}`}>
                    {hq ? 'المقر الرئيسي' : 'فرع'}
                  </span>
                  <div className="branch-page-details">
                    {branch.address && (
                      <p><span aria-hidden="true">📍</span> {branch.address}</p>
                    )}
                    <p>
                      <span aria-hidden="true">📞</span>{' '}
                      {branch.phone ? <a href={`tel:${branch.phone}`} dir="ltr">{branch.phone}</a> : '—'}
                    </p>
                  </div>
                  <div className="branch-detail-actions">
                    <Link to="/branches" className="btn btn-soft">جميع الفروع</Link>
                    {branch.phone && (
                      <a className="btn btn-primary" href={`tel:${branch.phone}`}>اتصل بالفرع</a>
                    )}
                    {branch.latitude != null && branch.longitude != null && (
                      <a
                        className="btn btn-outline"
                        href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        الموقع على الخريطة
                      </a>
                    )}
                  </div>
                </div>
              </article>

              <div className="branches-tabs-wrap">
                <TabBar
                  tabs={TABS.filter((t) => t.key !== 'dean' || branch.dean_name_ar || branch.dean_name_en)}
                  active={tab}
                  onSelect={setTab}
                />
              </div>

              {tab === 'dean' && (
                <>
                  {branch.dean_message_ar && (
                    <section className="card branch-dean-speech">
                      <div className="branch-dean-speech-head">
                        <div className="branch-dean-speech-avatar">
                    {branch.dean_image ? (
                      <img src={branch.dean_image} alt={`عميد فرع ${label ?? 'المعهد'}`} />
                    ) : (
                      <img src={logo} alt="شعار المعهد الوطني للعلوم الإدارية" />
                    )}
                  </div>
                        <div>
                          <span className="branch-dean-role">كلمة عميد فرع {label ?? 'المعهد'}</span>
                          <h2 className="branch-dean-speech-title">كلمة العميد</h2>
                        </div>
                      </div>
                      <div className="branch-dean-speech-body">
                        <div dangerouslySetInnerHTML={{ __html: decodeEntities(branch.dean_message_ar) }} />
                      </div>
                      {(branch.dean_name_ar || branch.dean_name_en) && (
                        <div className="branch-dean-speech-sign">
                          <div className="branch-dean-speech-line" />
                          <div className="branch-dean-speech-name">
                            {branch.dean_name_ar ?? branch.dean_name_en}
                            <span>عميد فرع {label ?? 'المعهد'}</span>
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                  {(branch.dean_name_ar || branch.dean_name_en) && (
                    <div className="card branch-dean-card">
<div className="branch-dean-avatar" aria-hidden="true">
                        {branch.dean_image ? (
                          <img src={branch.dean_image} alt={`عميد فرع ${label ?? 'المعهد'}`} />
                        ) : (
                          <img src={logo} alt="شعار المعهد الوطني للعلوم الإدارية" />
                        )}
                      </div>
                      <div className="branch-dean-role">عميد فرع {label ?? 'المعهد'}</div>
                      <h3 className="branch-dean-name">{branch.dean_name_ar ?? branch.dean_name_en}</h3>
                      <p className="branch-dean-bio">
                        يقوم عميد الفرع على إدارة شؤون الفرع الأكاديمية والإدارية وتحقيق رسالة المعهد في المحافظة.
                      </p>
                    </div>
                  )}
                </>
              )}

              {tab === 'news' && (
                <section className="branch-section" aria-labelledby="branch-news-title">
                  <h2 className="section-title" id="branch-news-title">أخبار الفرع</h2>
                  {newsItems.length > 0 ? (
                    <div className="news-grid">
                      {newsItems.slice(0, 6).map((item) => <NewsThumb key={item.id} item={item} />)}
                    </div>
                  ) : (
                    <p className="muted">لا توجد أخبار منشورة لهذا الفرع بعد.</p>
                  )}
                </section>
              )}

              {tab === 'events' && (
                <section className="branch-section" aria-labelledby="branch-events-title">
                  <h2 className="section-title" id="branch-events-title">فعاليات الفرع</h2>
                  {eventItems.length > 0 ? (
                    <div className="news-grid">
                      {eventItems.slice(0, 6).map((item) => <NewsThumb key={item.id} item={item} />)}
                    </div>
                  ) : (
                    <p className="muted">لا توجد فعاليات مسجلة لهذا الفرع حاليًا.</p>
                  )}
                </section>
              )}

              {tab === 'courses' && (
                <section className="branch-section" aria-labelledby="branch-courses-title">
                  <h2 className="section-title" id="branch-courses-title">دورات الفرع التدريبية</h2>
                  {courses.length > 0 ? (
                    <div className="courses-grid">
                      {courses.map((c) => (
                        <article key={c.id} className="card course-card">
                          {c.image_url && <img className="course-image" src={c.image_url} alt={c.title} loading="lazy" />}
                          <div className="course-body">
                            <h3>{c.title}</h3>
                            {c.description && <p>{c.description}</p>}
                            <div className="course-meta">
                              {c.location && <span className="course-loc">{c.location}</span>}
                              {c.capacity != null && <span>المقاعد: {c.capacity}</span>}
                            </div>
                            <Link to="/training/register" className="btn btn-primary">التسجيل</Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">لا توجد دورات مفتوحة لهذا الفرع حاليًا.</p>
                  )}
                </section>
              )}

              {tab === 'faculty' && (
                <section className="branch-section" aria-labelledby="branch-faculty-title">
                  <h2 className="section-title" id="branch-faculty-title">الكادر الأكاديمي للفرع</h2>
                  {faculty.length > 0 ? (
                    <>
                      {(() => {
                        const titles = Array.from(new Set(faculty.map((m) => m.title).filter(Boolean).map((t) => t.trim())))
                          .sort((a, b) => a.localeCompare(b, 'ar'));
                        return titles.length > 0 ? (
                          <div className="faculty-filters" role="tablist" aria-label="فلترة كادر الفرع حسب الرتبة">
                            <button
                              type="button"
                              role="tab"
                              aria-selected={facultyFilter === 'all'}
                              className={`faculty-filter${facultyFilter === 'all' ? ' faculty-filter--active' : ''}`}
                              onClick={() => setFacultyFilter('all')}
                            >
                              الكل
                            </button>
                            {titles.map((t) => (
                              <button
                                key={t}
                                type="button"
                                role="tab"
                                aria-selected={facultyFilter === t}
                                className={`faculty-filter${facultyFilter === t ? ' faculty-filter--active' : ''}`}
                                onClick={() => setFacultyFilter(t)}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        ) : null;
                      })()}
                      {(() => {
                        const visible = facultyFilter === 'all' ? faculty : faculty.filter((m) => (m.title ?? '').trim() === facultyFilter);
                        const groups = visible.reduce((acc, m) => {
                          const key = m.department_name_ar ?? 'عام';
                          (acc[key] ??= []).push(m);
                          return acc;
                        }, {});
                        return Object.keys(groups).length === 0
                          ? <p className="muted">لا يوجد أعضاء برتبة «{facultyFilter}» في هذا الفرع.</p>
                          : Object.entries(groups).map(([deptName, members]) => (
                              <div key={deptName} style={{ marginBottom: 32 }}>
                                <h3 className="faculty-dept-title">{deptName}</h3>
                                <div className="faculty-grid">
                                  {members.map((m) => (
                                    <article key={m.id} className="card faculty-card">
                                      {m.photo ? (
                                        <img className="faculty-photo" src={m.photo} alt={m.name_ar} loading="lazy" />
                                      ) : (
                                        <div className="faculty-photo faculty-photo--placeholder" aria-hidden="true">
                                          {(m.name_ar ?? 'NIAS').slice(0, 1)}
                                        </div>
                                      )}
                                      <h3>{m.name_ar}</h3>
                                      {m.title && <span className="faculty-title">{m.title}</span>}
                                      {m.specialization && <span className="faculty-spec">{m.specialization}</span>}
                                      <div className="faculty-contacts">
                                        {m.email && <a href={`mailto:${m.email}`} dir="ltr">{m.email}</a>}
                                        {m.phone && <span dir="ltr">{m.phone}</span>}
                                      </div>
                                    </article>
                                  ))}
                                </div>
                              </div>
                            ));
                      })()}
                    </>
                  ) : (
                    <p className="muted">لا يوجد كادر أكاديمي مسجل لهذا الفرع بعد.</p>
                  )}
                </section>
              )}
            </>
          )}

          {slug && !branch && !error && (
            <div className="card branch-notfound">
              <h2>الفرع غير موجود</h2>
              <p className="muted">لم يتم العثور على هذا الفرع.</p>
              <Link to="/branches" className="btn btn-primary">عرض جميع الفروع</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}