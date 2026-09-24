import { useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState(null);

  usePageMeta('تواصل معنا', 'تواصل مع المعهد الوطني للعلوم الإدارية: أمانة العاصمة صنعاء — شارع العدل. هاتف 01222537.');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setErrors(null);
    try {
      await api.post('/public/contact', form);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setErrors(err.details ?? [{ message: err.message }]);
    }
  };

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">تواصل معنا</h1>
        <p className="section-subtitle">أرسل استفسارك وسنرد عليك في أقرب وقت.</p>

        {status === 'success' && (
          <div className="alert alert-success" role="status">تم إرسال رسالتك بنجاح.</div>
        )}

        {errors && (
          <div className="alert alert-danger" role="alert">
            <ul>
              {errors.map((e, i) => <li key={i}>{e.message ?? e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">الاسم *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required minLength={2} />
            </div>
            <div className="form-field">
              <label htmlFor="email">البريد الإلكتروني *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="phone">الهاتف</label>
              <input id="phone" name="phone" dir="ltr" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="subject">الموضوع</label>
              <input id="subject" name="subject" value={form.subject} onChange={handleChange} />
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="message">الرسالة *</label>
              <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} required minLength={5} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">إرسال الرسالة</button>
        </form>
      </div>
    </section>
  );
}