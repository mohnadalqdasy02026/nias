import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { renderRichText } from '../lib/richText.js';

// صفحات المحتوى التعريفي (الرؤية/الرسالة/الأهداف/المسيرة) تُحرَّر من لوحة التحكم
// عبر «إدارة الصفحات» بالـ slugs التالية.
export const INTRO_SLUGS = ['vision', 'mission', 'goals', 'history'];

const INTRO_ICONS = {
  vision: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  mission: 'M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 16.8 6.2 19.9l1.1-6.5L2.6 8.8l6.5-.9z',
  goals: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
  history: 'M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 3M3 4v4h4',
};

export function IntroBlock({ page, className }) {
  if (!page?.content_ar) return null;
  const icon = INTRO_ICONS[page.slug];
  return (
    <section className={`card intro-block ${className ?? ''}`} aria-labelledby={`intro-${page.slug}`}>
      <h2 id={`intro-${page.slug}`}>
        {icon && (
          <span className="intro-block-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
          </span>
        )}
        <span>{page.title_ar}</span>
      </h2>
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
