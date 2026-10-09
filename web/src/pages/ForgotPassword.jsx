import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function ForgotPassword() {
  usePageMeta('استعادة كلمة المرور', 'استعادة كلمة مرور حسابك في لوحة إدارة المعهد الوطني للعلوم الإدارية.');
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      const data = await api.post('/auth/forgot-password', { identifier });
      setStatus(data);
    } catch (err) {
      setError(err.message ?? 'حدث خطأ');
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-card">
        <h1 className="section-title">استعادة كلمة المرور</h1>
        <p className="section-subtitle">أدخل حسابك وسنرسل لك رابط إعادة التعيين عبر البريد الإلكتروني.</p>

        {status && (
          <div className="alert alert-success" role="status">
            {status.message}
          </div>
        )}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label htmlFor="identifier">البريد / الرقم الأكاديمي / الجوال</label>
            <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required dir="ltr" />
          </div>
          <button type="submit" className="btn btn-primary">إرسال رابط الاستعادة</button>
        </form>

        <p className="muted auth-note"><Link to="/login">← عودة لتسجيل الدخول</Link></p>
      </div>
    </section>
  );
}