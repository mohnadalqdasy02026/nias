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
          <div className="about-content">
            <p className="muted"><strong>المعهد الوطني للعلوم الإدارية (NIAS)</strong> مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية. يُقيم المعهد مقره الرئيسي (<strong>الديوان العام</strong>) في العاصمة صنعاء، متأسساً في <strong>1963م</strong> كواحد من معاهد التدريب العربية الرائدة في العلوم الإدارية والبحوث والتطوير القومي.</p>

            <ul className="about-list">
              <li><strong>الرؤية:</strong> إحداث تنمية إدارية شاملة من خلال إعداد وتأهيل القيادات الإدارية، وتدريب الموظفين في أجهزة الدولة والمؤسسات العامة.</li>
              <li><strong>الرسالة:</strong> تقديم الاستشارات العلمية والفنية للجهات الحكومية، وإعداد ونشر البحوث والدراسات المتعلقة بالتنمية الإدارية، وتنظيم المؤتمرات والندوات والورش في مجالات تنمية القوى البشرية وعلوم الإدارة.</li>
              <li><strong>النشاطات:</strong> برامج تدريبية متخصصة لجهات حكومية مختلفة (وزارة الخدمة المدنية، المؤسسة العامة للاتصالات، الهيئة العامة للزكاة، البريد)، وتنوع البرامج بين مهارات الإدارة المتقدمة، وبرامج الذكاء الاصطناعي، وتطوير الخدمات للمواطنين، وإدارة الموارد البشرية.</li>
              <li><strong>الفروع:</strong> يمتد المعهد عبر 6 فروع رئيسية في محافظات: عدن، إب، حضرموت، الحديدة، صعدة، بالإضافة إلى <strong>الديوان العام</strong>.</li>
              <li><strong>الكليات والمراكز:</strong> يضم 11 كلية ومركز، و8 أقسام علمية، ويقدم 13 برنامجاً أكاديمياً وتدريبياً.</li>
              <li><strong>الإحصاءات:</strong> أكثر من 4,900 طالب وطالبة، واحتياط 187 عضو هيئة تدريس، ومجلة علمية خاصة بنشر الأبحاث المحكمة في العلوم الإدارية والاقتصادية.</li>
            </ul>

            <p className="muted"><strong>ملاحظة:</strong> المحتوى تعرّض للمراجعة النهائية من قبل الإدارة ويمكن تحديثه عبر لوحة التحكم الإدارية.</p>
          </div>
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
