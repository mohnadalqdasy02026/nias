import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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