import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { IntroBlock, INTRO_SLUGS, useIntroPages } from '../components/IntroBlocks.jsx';

export default function About() {
  const [page, setPage] = useState(null);
  const intro = useIntroPages();

  usePageMeta('عن المعهد', 'تعرف على المعهد الوطني للعلوم الإدارية في اليمن: رسالته وأهدافه ومسيرته في بناء القدرات الإدارية وتأهيل الكوادر.');

  useEffect(() => {
    api.get('/public/pages/about').then(setPage).catch(() => {});
  }, []);

  const hasIntro = INTRO_SLUGS.some((s) => intro[s]?.content_ar);

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? 'عن المعهد'}</h1>
        {page ? (
          <article className="about-content">
            {page.primary_image && (
              <img className="about-hero-image" src={page.primary_image} alt={page.title_ar ?? 'عن المعهد'} />
            )}
            <div dangerouslySetInnerHTML={{ __html: page.content_ar }} />
          </article>
        ) : (
          <p className="muted">المعهد الوطني للعلوم الإدارية (NIAS) هو مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية.</p>
        )}

        {hasIntro && (
          <div className="intro-blocks">
            <div className="intro-blocks-row">
              <IntroBlock page={intro.vision} className="intro-block--vision" />
              <IntroBlock page={intro.mission} className="intro-block--mission" />
            </div>
            <IntroBlock page={intro.goals} className="intro-block--goals" />
            <IntroBlock page={intro.history} className="intro-block--history" />
          </div>
        )}
      </div>
    </section>
  );
}
