export default function Forbidden({ permission }) {
  return (
    <section className="container admin-center">
      <h1 className="section-title">غير مصرح (403)</h1>
      <p className="muted">
        لا تملك الصلاحية المطلوبة للوصول إلى هذه الصفحة.
        {permission && <><br />الصلاحية المطلوبة: <code>{permission}</code></>}
      </p>
    </section>
  );
}