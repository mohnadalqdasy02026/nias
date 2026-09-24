import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../contexts/auth.jsx';

const statGroups = [
  {
    title: 'المحتوى',
    keys: ['newsPublished', 'newsDrafts', 'pagesPublished'],
  },
  {
    title: 'التدريب',
    keys: ['trainingCourses', 'trainingEnrollments'],
  },
];

const quickActions = [
  { to: '/admin/content/news', label: 'إضافة خبر', perm: 'news.create', icon: '📰' },
  { to: '/admin/content/pages', label: 'تحرير الصفحات الثابتة', perm: 'site_pages.update', icon: '📄' },
  { to: '/admin/training/courses', label: 'إدارة الدورات التدريبية', perm: 'training_courses.create', icon: '🎯' },
  { to: '/admin/programs', label: 'البرامج الأكاديمية', perm: 'academic_programs.update', icon: '🎓' },
  { to: '/admin/media', label: 'مكتبة الوسائط', perm: 'media_library.create', icon: '🖼️' },
  { to: '/admin/settings/site', label: 'إعدادات الموقع', perm: 'site_settings.read', icon: '⚙️' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const perms = user?.permissions ?? [];

  useEffect(() => {
    api.get('/admin/stats', { auth: true }).then(setStats).catch((e) => setError(e.message));
  }, []);

  const has = (perm) => perms.includes(perm);

  const visibleCounts = Object.entries({
    branches: stats?.branches ?? 0,
    programs: stats?.programs ?? 0,
    newsPublished: stats?.newsPublished ?? 0,
    pagesPublished: stats?.pagesPublished ?? 0,
    trainingCourses: stats?.trainingCourses ?? 0,
    usersActive: stats?.usersActive ?? 0,
  });

  return (
    <section>
      <div className="admin-welcome">
        <div>
          <h1 className="admin-page-title">مرحبًا، {user?.nameAr ?? user?.nameEn}</h1>
          <p className="muted">إليك لمحة عامة عن محتوى الموقع ونشاطه اليوم.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!stats && !error && <p className="admin-loading">جارٍ التحميل...</p>}

      {stats && (
        <>
          <div className="admin-stat-grid admin-stat-grid--main">
            {visibleCounts.map(([key, value]) => (
              <div key={key} className="card admin-stat-card">
                <span className="admin-stat-value">{value}</span>
                <span className="admin-stat-label">
                  {{
                    branches: 'الفروع النشطة',
                    programs: 'البرامج النشطة',
                    newsPublished: 'أخبار منشورة',
                    pagesPublished: 'صفحات منشورة',
                    trainingCourses: 'دورات مفتوحة',
                    usersActive: 'مستخدمون نشطون',
                  }[key]}
                </span>
              </div>
            ))}
          </div>

          <div className="admin-dash-grid">
            {statGroups.map((group) => {
              if (!group.keys.some((k) => stats[k] !== undefined)) return null;
              return (
                <div key={group.title} className="card admin-dash-card">
                  <h3>{group.title}</h3>
                  <div className="admin-stat-grid admin-stat-grid--nested">
                    {group.keys.map((key) => (
                      <div key={key} className="admin-stat-cell">
                        <strong>{stats[key] ?? 0}</strong>
                        <small>
                          {{
                            newsPublished: 'أخبار منشورة',
                            newsDrafts: 'مسودات',
                            pagesPublished: 'صفحات منشورة',
                            trainingCourses: 'دورات مفتوحة',
                            trainingEnrollments: 'تسجيلات',
                          }[key]}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-dash-block">
            <h3 className="admin-dash-title">إجراءات سريعة</h3>
            <div className="admin-quick-grid">
              {quickActions.filter((q) => has(q.perm)).map((q) => (
                <Link key={q.to} to={q.to} className="card admin-quick-card">
                  <span className="admin-quick-icon" aria-hidden="true">{q.icon}</span>
                  <span className="admin-quick-label">{q.label}</span>
                </Link>
              ))}
            </div>
            {!quickActions.some((q) => has(q.perm)) && (
              <p className="muted">تسجيل دخول بعرض فقط — لا تتوفر إجراءات سريعة.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}