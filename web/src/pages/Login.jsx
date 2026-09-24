import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(identifier, password);
      const redirectTo = from ?? (user?.permissions?.includes('dashboard.access') ? '/admin' : '/');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message ?? 'فشل تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-card">
        <h1 className="section-title">تسجيل الدخول</h1>
        <p className="section-subtitle">أدخل بريدك الإلكتروني أو رقمك الأكاديمي أو هاتفك.</p>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label htmlFor="identifier">البريد / الرقم الأكاديمي / الجوال</label>
            <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required dir="ltr" />
          </div>
          <div className="form-field">
            <label htmlFor="password">كلمة المرور</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="muted auth-note">
          <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
        </p>
      </div>
    </section>
  );
}