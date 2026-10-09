import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { renderRichText } from '../lib/richText.js';

// صفحات المحتوى التعريفي (الرؤية/الرسالة/الأهداف/المسيرة) تُحرَّر من لوحة التحكم
// عبر «إدارة الصفحات» بالـ slugs التالية.
export const INTRO_SLUGS = ['vision', 'mission', 'goals', 'history'];

export function IntroBlock({ page, className }) {
  if (!page?.content_ar) return null;
  return (
    <section className={`card intro-block ${className ?? ''}`} aria-labelledby={`intro-${page.slug}`}>
      <h2 id={`intro-${page.slug}`}>{page.title_ar}</h2>
      <div className="intro-block-body" dangerouslySetInnerHTML={{ __html: renderRichText(page.content_ar) }} />
      {page.primary_image && <img className="intro-block-image" src={page.primary_image} alt={page.title_ar} loading="lazy" />}
    </section>
  );
}

// يجلب الصفحات المنشورة ويحولها إلى خريطة بالمعرّف (slug).
export function useIntroPages() {
  const [pages, setPages] = useState([]);
  useEffect(() => {
    api.get('/public/pages').then(setPages).catch(() => {});
  }, []);
  return useMemo(() => {
    const map = {};
    for (const p of pages ?? []) if (INTRO_SLUGS.includes(p.slug)) map[p.slug] = p;
    return map;
  }, [pages]);
}
