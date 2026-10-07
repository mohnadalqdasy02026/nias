import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client.js';
import { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';

function emptyCourse(level_no, semester_no) {
  return {
    level_no,
    semester_no,
    course_code: '',
    name_ar: '',
    name_en: '',
    credit_hours: 3,
    is_optional: false,
  };
}

export default function StudyPlanEditor({ programId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLevel, setNewLevel] = useState('1');
  const [newSemester, setNewSemester] = useState('1');

  useEffect(() => {
    if (!programId) return;
    setLoading(true);
    setError(null);
    api.get(`/admin/programs/${programId}/courses`, { auth: true })
      .then((rows) => setCourses((rows ?? []).map((c) => ({ ...c }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [programId]);

  const semesters = useMemo(() => {
    const map = new Map();
    courses.forEach((c, idx) => {
      const key = `${c.level_no}|${c.semester_no}`;
      if (!map.has(key)) map.set(key, { level_no: c.level_no, semester_no: c.semester_no, items: [] });
      map.get(key).items.push({ ...c, _idx: idx });
    });
    return [...map.values()].sort(
      (a, b) => Number(a.level_no) - Number(b.level_no) || Number(a.semester_no) - Number(b.semester_no),
    );
  }, [courses]);

  const updateCourse = (idx, field, value) => {
    setCourses((list) => list.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addCourse = (level_no, semester_no) => {
    setCourses((list) => [...list, emptyCourse(level_no, semester_no)]);
    setSaved(false);
  };

  const removeCourse = (idx) => {
    setCourses((list) => list.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const addSemester = () => {
    const level = Number(newLevel);
    const sem = Number(newSemester);
    if (!level || !sem) { setError('أدخل المستوى والفصل قبل إضافتهما.'); return; }
    setCourses((list) => [...list, emptyCourse(level, sem)]);
    setError(null);
    setSaved(false);
  };

  const save = async () => {
    const rows = courses.filter((c) => c.name_ar?.trim());
    if (rows.length !== courses.length) {
      if (!window.confirm('توجد مقررات بدون اسم (وستُتجاهل). هل تريد المتابعة؟')) return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = rows.map((c) => ({
        level_no: Number(c.level_no),
        semester_no: Number(c.semester_no),
        course_code: c.course_code?.trim() || null,
        name_ar: c.name_ar.trim(),
        name_en: c.name_en?.trim() || null,
        credit_hours: Number(c.credit_hours) || 3,
        is_optional: Boolean(c.is_optional),
      }));
      const data = await api.put(`/admin/programs/${programId}/courses`, body, { auth: true });
      setCourses((data ?? []).map((c) => ({ ...c })));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('إفراغ الخطة الدراسية بالكامل من هذا البرنامج؟')) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api.put(`/admin/programs/${programId}/courses`, [], { auth: true });
      setCourses((data ?? []).map((c) => ({ ...c })));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">جارٍ تحميل الخطة الدراسية…</p>;

  return (
    <AdminFormSection title="الخطة الدراسية">
      <p className="muted">
        تُعرض الخطة الدراسية للزوار في صفحة البرنامج على هيئة جداول حسب المستوى والفصل.
        يمكنك تعديل المقررات وإعادة الحفظ — الأحرف غير محفوظة ما لم تضغط «حفظ الخطة الدراسية».
      </p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {saved && <div className="alert alert-success" role="alert">تم حفظ الخطة الدراسية بنجاح.</div>}

      {semesters.length === 0 ? (
        <p className="muted admin-empty">لا توجد مقررات في الخطة الدراسية لهذا البرنامج بعد.</p>
      ) : (
        semesters.map((s) => (
          <div className="admin-courses-grid" key={`${s.level_no}|${s.semester_no}`}>
            <h3 className="admin-courses-title">المستوى {s.level_no} — الفصل {s.semester_no}</h3>
            {s.items.map((c) => (
              <div className="admin-course-rows" key={c._idx}>
                <input
                  className="admin-course-code"
                  value={c.course_code}
                  onChange={(e) => updateCourse(c._idx, 'course_code', e.target.value)}
                  placeholder="الرمز"
                  dir="ltr"
                />
                <input
                  className="admin-course-name"
                  value={c.name_ar}
                  onChange={(e) => updateCourse(c._idx, 'name_ar', e.target.value)}
                  placeholder="اسم المقرر بالعربية"
                />
                <input
                  className="admin-course-name"
                  value={c.name_en}
                  onChange={(e) => updateCourse(c._idx, 'name_en', e.target.value)}
                  placeholder="بالانجليزية (اختياري)"
                  dir="ltr"
                />
                <input
                  className="admin-course-hours"
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={c.credit_hours}
                  onChange={(e) => updateCourse(c._idx, 'credit_hours', e.target.value)}
                  title="الساعات المعتمدة"
                />
                <label className="admin-course-optional">
                  <input
                    type="checkbox"
                    checked={Boolean(c.is_optional)}
                    onChange={(e) => updateCourse(c._idx, 'is_optional', e.target.checked)}
                  />
                  اختياري
                </label>
                <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeCourse(c._idx)}>حذف</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-soft" onClick={() => addCourse(s.level_no, s.semester_no)}>+ إضافة مقرر</button>
          </div>
        ))
      )}

      <div className="admin-courses-addsem">
        <span>إضافة فصل جديد:</span>
        <input className="admin-course-hours" type="number" min="1" max="10" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} title="المستوى" />
        <input className="admin-course-hours" type="number" min="1" max="10" value={newSemester} onChange={(e) => setNewSemester(e.target.value)} title="الفصل" />
        <button type="button" className="btn btn-sm btn-soft" onClick={addSemester}>+ إضافة مقرر في هذا الفصل</button>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ الخطة الدراسية'}
        </button>
        {courses.length > 0 && (
          <button type="button" className="btn btn-danger-soft" disabled={saving} onClick={clearAll}>إفراغ الخطة</button>
        )}
      </div>
    </AdminFormSection>
  );
}