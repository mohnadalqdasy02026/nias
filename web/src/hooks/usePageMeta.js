import { useEffect } from 'react';

const SITE_NAME = 'المعهد الوطني للعلوم الإدارية';
const DEFAULT_OG_IMAGE = '/uploads/design/site/main_1787497216_201.jpg';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let meta = document.querySelector(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function usePageMeta(title, description, { image, url, type } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    if (description) upsertMeta('name', 'description', description);

    const finalTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const imageUrl = image ?? DEFAULT_OG_IMAGE;
    const currentUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

    upsertMeta('property', 'og:title', finalTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:type', type ?? 'website');
    upsertMeta('property', 'og:url', currentUrl);

    upsertMeta('name', 'twitter:title', finalTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    if (currentUrl) upsertCanonical(currentUrl);
  }, [title, description, image, url, type]);
}