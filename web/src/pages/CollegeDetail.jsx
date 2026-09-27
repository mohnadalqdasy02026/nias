import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchLabel } from '../lib/branch.js';

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
  const [error, setError] = useState(null);
  const settings = useSiteSettings();
  const logo = settings?.general?.logo ?? '/uploads/design/site/logo.jpg';

  usePageMeta(
    college?.name_ar ? `كلية ${college.name_ar}` : 'الكلية',
    college?.about ?? 'صفحة كلية من كليات المعهد الوطني للعلوم الإدارية.',
  );

  useEffect(() => {
    setError(null);
    setCollege(null);
    api.get(`/public/colleges/${id}`).then(setCollege).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="card college-page-empty">
            <h2>الكلية غير موجودة</h2>
            <p className="muted">تعذر العثور على هذه الكلية أو أنها غير منشورة.</p>
            <Link to="/branches" className="btn btn-primary">العودة إلى الفروع</Link>
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
            <Link to="/branches">الفروع</Link>
            {college.branch_slug && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={backTo}>{branchLabel(college.branch_name_ar) ?? college.branch_name_ar}</Link>
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
                {branchLabel(college.branch_name_ar) ?? college.branch_name_ar}
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
              <h2 id="college-dean-title">عميد الكلية</h2>
              <div className="college-page-dean-inner">
                <div className="college-page-dean-photo">
                  {college.dean_image ? (
                    <img src={college.dean_image} alt={`عميد ${college.name_ar}`} />
                  ) : (
                    <img src={logo} alt="شعار المعهد الوطني للعلوم الإدارية" />
                  )}
                </div>
                <div className="college-page-dean-info">
                  {dean && (
                    <div className="college-page-dean-name">
                      <strong>{dean}</strong>
                      <span className="college-page-dean-role">عميد {college.name_ar}</span>
                    </div>
                  )}
                  {college.dean_message_ar && (
                    <>
                      <span className="college-page-dean-role">كلمة عميد {college.name_ar}</span>
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

          <div className="college-page-actions">
            <Link to={backTo} className="btn btn-soft">رجوع إلى الفرع</Link>
          </div>
        </div>
      </section>
    </>
  );
}
