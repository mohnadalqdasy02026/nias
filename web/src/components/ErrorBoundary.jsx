import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: String(error?.message ?? error ?? 'خطأ غير معروف') };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section notfound-section">
          <div className="container notfound-box">
            <p className="notfound-code" aria-hidden="true">!</p>
            <h1 className="section-title">حدث خطأ غير متوقع</h1>
            <p className="muted">تعذّر عرض هذه الصفحة حاليًا. جرّب إعادة التحميل أو عد لاحقًا.</p>
            {this.state.message && (
              <p className="muted" dir="ltr" style={{ userSelect: 'all', fontSize: '0.8rem', wordBreak: 'break-word' }}>
                {this.state.message}
              </p>
            )}
            <div className="notfound-actions">
              <a className="btn btn-primary" href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                إعادة تحميل الصفحة
              </a>
            </div>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}