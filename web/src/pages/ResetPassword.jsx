import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function ResetPassword() {
  usePageMeta('تعيين كلمة مرور جديدة', 'تعيين كلمة مرور جديدة لحسابك في لوحة إدارة المعهد الوطني للعلوم الإدارية.');
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب ألا تقل عن 8 أحرف.');
      return;
    }
    if (newPassword !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setBusy(true);
    try {
      const data = await api.post('/auth/reset-password', { token: token.trim(), newPassword });
      setStatus(data);
    } catch (err) {
      setError(err.message ?? 'تعذر إعادة تعيين كلمة المرور');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-card">
        <h1 className="section-title">إعادة تعيين كلمة المرور</h1>
        <p className="section-subtitle">أدخل الرمز المستلم وكلمة المرور الجديدة.</p>

        {status && (
          <div className="alert alert-success" role="status">
            {status.message}
            <p className="muted"><Link to="/login">تسجيل الدخول الآن ←</Link></p>
          </div>
        )}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {!status && (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-field">
              <label htmlFor="token">رمز إعادة التعيين</label>
              <input id="token" value={token} onChange={(e) => setToken(e.target.value)} required dir="ltr" />
            </div>
            <div className="form-field">
              <label htmlFor="newPassword">كلمة المرور الجديدة</label>
              <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} dir="ltr" />
            </div>
            <div className="form-field">
              <label htmlFor="confirm">تأكيد كلمة المرور</label>
              <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} dir="ltr" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'جارٍ الحفظ...' : 'إعادة التعيين'}
            </button>
          </form>
        )}

        <p className="muted auth-note"><Link to="/forgot-password">← طلب رمز جديد</Link></p>
      </div>
    </section>
  );
}