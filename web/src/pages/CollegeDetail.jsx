import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchTitle } from '../lib/branch.js';
import { collegeHeadNoun, collegeHeadRole, collegeHeadWord } from '../lib/college.js';

const decodeEntities = (s) =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');

export default function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [depts, setDepts] = useState([]);
  const [error, setError] = useState(null);
  const settings = useSiteSettings();
  const logo = settings?.general?.logo ?? '/uploads/design/site/logo.jpg';

  usePageMeta(
    college?.name_ar ? (/^(كلية|مركز|معهد|أكاديمية|كليات)(\s|$)/.test(college.name_ar) ? college.name_ar : `كلية ${college.name_ar}`) : 'الكلية',
    college?.about ?? 'صفحة كلية من كليات المعهد الوطني للعلوم الإدارية.',
  );

  useEffect(() => {
    setError(null);
    setCollege(null);
    api.get(`/public/colleges/${id}`).then(setCollege).catch((e) => setError(e.message));
    api.get(`/public/departments?collegeId=${id}`)
      .then((rows) => setDepts(rows ?? []))
      .catch(() => setDepts([]));
  }, [id]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="card college-page-empty">
            <h2>الكلية غير موجودة</h2>
            <p className="muted">تعذر العثور على هذه الكلية أو أنها غير منشورة.</p>
            <Link to="/colleges" className="btn btn-primary">العودة إلى الكليات</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!college) {
    return (
      <section className="section">
        <div className="container"><p className="muted">جاري التحميل...</p></div>
      </section>
    );
  }

  const dean = college.dean_name_ar ?? college.dean_name_en ?? college.dean_name;
  const backTo = college.branch_slug ? `/branches/${college.branch_slug}` : '/branches';

  return (
    <>
      <section className="college-page-hero">
        <div className="container">
          <nav className="college-page-crumbs" aria-label="مسار الصفحة">
            <Link to="/colleges">الكليات</Link>
            {college.branch_slug && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={backTo}>{branchTitle(college.branch_name_ar) ?? college.branch_name_ar}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{college.name_ar}</span>
          </nav>
        </div>
      </section>

      <section className="section">
        <div className="container college-page">
          <div className="college-page-cover">
            {college.image ? (
              <img
                src={college.image}
                alt={college.name_ar}
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
            ) : (
              <div className="college-page-cover-placeholder" aria-hidden="true">
                <span>{college.name_ar?.slice(0, 1) ?? 'ك'}</span>
              </div>
            )}
          </div>

          <header className="college-page-head">
            <h1>{college.name_ar}</h1>
            {college.name_en && <span className="college-page-en" dir="ltr">{college.name_en}</span>}
            {college.branch_name_ar && (
              <Link to={backTo} className="college-page-branch">
                {branchTitle(college.branch_name_ar) ?? college.branch_name_ar}
              </Link>
            )}
          </header>

          {college.about && <p className="college-page-about">{college.about}</p>}

          {(college.vision || college.mission) && (
            <div className="college-page-vm">
              {college.vision && (
                <div className="card college-page-vm-item">
                  <h2>الرؤية</h2>
                  <p>{college.vision}</p>
                </div>
              )}
              {college.mission && (
                <div className="card college-page-vm-item">
                  <h2>الرسالة</h2>
                  <p>{college.mission}</p>
                </div>
              )}
            </div>
          )}

          {(dean || college.dean_message_ar || college.dean_message_en) && (
            <section className="card college-page-dean" aria-labelledby="college-dean-title">
              <h2 id="college-dean-title">{collegeHeadWord(college.name_ar)} {collegeHeadNoun(college.name_ar)}</h2>
              <div className="college-page-dean-inner">
                <div className="college-page-dean-photo">
                  {college.dean_image ? (
                    <img src={college.dean_image} alt={collegeHeadRole(college.name_ar)} />
                  ) : (
                    <img src={logo} alt="شعار المعهد الوطني للعلوم الإدارية" />
                  )}
                </div>
                <div className="college-page-dean-info">
                  {dean && (
                    <div className="college-page-dean-name">
                      <strong>{dean}</strong>
                      <span className="college-page-dean-role">{collegeHeadRole(college.name_ar)}</span>
                    </div>
                  )}
                  {college.dean_message_ar && (
                    <>
                      <span className="college-page-dean-role">كلمة {collegeHeadRole(college.name_ar)}</span>
                      <div
                        className="college-page-dean-message"
                        dangerouslySetInnerHTML={{ __html: decodeEntities(college.dean_message_ar) }}
                      />
                    </>
                  )}
                  {college.dean_message_en && (
                    <>
                      <span className="college-page-dean-role">Dean&apos;s message</span>
                      <div
                        className="college-page-dean-message"
                        dir="ltr"
                        dangerouslySetInnerHTML={{ __html: decodeEntities(college.dean_message_en) }}
                      />
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {depts.length > 0 && (
            <section className="card college-page-depts" aria-labelledby="college-depts-title">
              <h2 id="college-depts-title">الأقسام العلمية</h2>
              <p className="college-page-depts-sub">
                تضم {college.name_ar} {depts.length === 1 ? 'قسمًا أكاديميًا واحدًا يعمل بكفاءة' : `${depts.length} أقسام أكاديمية`}. اضغط على أي قسم لاستعراض نبذته وبرامجه ورئيسه.
              </p>
              <div className="college-depts-grid">
                {depts.map((d) => (
                  <Link key={d.id} to={`/departments/${d.id}`} className="college-dept-card">
                    <h3>{d.name_ar.replace(/^قسم\s+/, '')}</h3>
                    {d.head_name_ar && <span className="college-dept-head">{d.head_name_ar}{d.head_title ? ` · ${d.head_title}` : ''}</span>}
                    {d.description && (
                      <p>{d.description.length > 150 ? `${d.description.slice(0, 150)}…` : d.description}</p>
                    )}
                    <span className="college-dept-more">
                      {d.programs_count ? `${d.programs_count} برنامج` : 'مزيد من التفاصيل'} ←
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="college-page-actions">
            <Link to={backTo} className="btn btn-soft">رجوع إلى الفرع</Link>
          </div>
        </div>
      </section>
    </>
  );
}
