import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotFound from '../errors/NotFound';

function PublicCmsPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['cms', slug],
    queryFn: () => cmsService.getPageBySlug(slug),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!data?.data?.page) return <NotFound />;

  const page = data.data.page;

  return (
    <>
      {/* Scoped CSS for WordPress-style HTML rendering */}
      <style>{`
        .cms-content h1 { font-size: 2rem; font-weight: 700; margin: 1.75rem 0 1rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; line-height: 1.25; }
        .cms-content h2 { font-size: 1.6rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.4rem; line-height: 1.3; }
        .cms-content h3 { font-size: 1.3rem; font-weight: 600; margin: 1.25rem 0 0.6rem; color: #1e293b; line-height: 1.35; }
        .cms-content h4 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #1e293b; }
        .cms-content h5 { font-size: 1rem; font-weight: 600; margin: 0.9rem 0 0.45rem; color: #334155; }
        .cms-content h6 { font-size: 0.9rem; font-weight: 600; margin: 0.8rem 0 0.4rem; color: #475569; }

        .cms-content p { margin: 0 0 1.1rem; line-height: 1.85; color: #334155; font-size: 0.975rem; }

        .cms-content a { color: #0284c7; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .cms-content a:hover { color: #0369a1; }

        .cms-content strong, .cms-content b { font-weight: 700; color: #0f172a; }
        .cms-content em, .cms-content i { font-style: italic; }
        .cms-content u { text-decoration: underline; text-underline-offset: 2px; }
        .cms-content s, .cms-content strike { text-decoration: line-through; color: #94a3b8; }

        .cms-content ul { list-style: disc; padding-left: 1.75rem; margin: 0 0 1.1rem; }
        .cms-content ol { list-style: decimal; padding-left: 1.75rem; margin: 0 0 1.1rem; }
        .cms-content li { margin: 0.35rem 0; line-height: 1.75; color: #334155; font-size: 0.975rem; }
        .cms-content ul ul, .cms-content ol ol, .cms-content ul ol, .cms-content ol ul { margin: 0.3rem 0 0.3rem 1rem; }

        .cms-content blockquote { border-left: 4px solid #0284c7; background: #f0f9ff; margin: 1.5rem 0; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; }
        .cms-content blockquote p { color: #0369a1; font-style: italic; margin: 0; font-size: 1rem; }

        .cms-content pre { background: #1e293b; color: #e2e8f0; padding: 1.25rem; border-radius: 10px; overflow-x: auto; margin: 1.25rem 0; font-size: 0.85rem; line-height: 1.7; }
        .cms-content code { background: #f1f5f9; color: #0284c7; padding: 0.15em 0.45em; border-radius: 4px; font-size: 0.875em; font-family: 'Courier New', monospace; }
        .cms-content pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

        .cms-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
        .cms-content th { background: #f8fafc; color: #0f172a; font-weight: 600; padding: 0.65rem 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .cms-content td { padding: 0.6rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
        .cms-content tr:last-child td { border-bottom: none; }
        .cms-content tr:hover td { background: #f8fafc; }

        .cms-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 1.25rem 0; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

        .cms-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 2rem 0; }

        .cms-content .ql-align-center { text-align: center; }
        .cms-content .ql-align-right { text-align: right; }
        .cms-content .ql-align-justify { text-align: justify; }

        .cms-content .ql-indent-1 { padding-left: 2rem; }
        .cms-content .ql-indent-2 { padding-left: 4rem; }
        .cms-content .ql-indent-3 { padding-left: 6rem; }
        .cms-content .ql-indent-4 { padding-left: 8rem; }
        .cms-content .ql-indent-5 { padding-left: 10rem; }

        .cms-content .ql-video { width: 100%; aspect-ratio: 16/9; border-radius: 10px; margin: 1.25rem 0; }
      `}</style>

      <div className=" py-8 sm:py-12 px-4">
        <div className="max-w-[900px] mx-auto">

          {/* Page Title Block */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight text-center">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="mt-3 text-base text-slate-500 leading-relaxed max-w-2xl">
                {page.excerpt}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent" />
              <span className="text-xs text-slate-400 shrink-0">
                {page.updatedAt
                  ? `Updated ${new Date(page.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : new Date(page.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-primary-200 to-transparent" />
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-8 sm:px-10 sm:py-10">
            <div
              className="cms-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>

        </div>
      </div>
    </>
  );
}

export default PublicCmsPage;