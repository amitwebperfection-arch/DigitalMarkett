import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cmsService } from '../../services/cms.service';

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    seo: { metaTitle: '', metaDescription: '' }
  });

  const [editorMode, setEditorMode] = useState('visual');
  const [pageLoaded, setPageLoaded] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await cmsService.getPageById(id);
        const page = res.data?.page || res.data;
        setForm({
          title: page.title || '',
          slug: page.slug || '',
          content: page.content || '',
          excerpt: page.excerpt || '',
          status: page.status || 'draft',
          seo: {
            metaTitle: page.seo?.metaTitle || '',
            metaDescription: page.seo?.metaDescription || '',
          }
        });
        setPageLoaded(true); 
      } catch (err) {
        console.error('Fetch error:', err.response?.data);
      }
    };
    fetchPage();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSeoChange = (e) => {
    setForm({ ...form, seo: { ...form.seo, [e.target.name]: e.target.value } });
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm({ ...form, title, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cmsService.updatePage(id, form);
      navigate('/admin/pages');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  if (!pageLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Edit Page</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">

        {/* ── Left Column ── */}
        <div className="col-span-2 space-y-4">

          {/* Title + Slug */}
          <div className="bg-white p-4 rounded shadow space-y-3">
            <input
              type="text"
              name="title"
              value={form.title}
              placeholder="Page Title"
              onChange={handleTitleChange}  
              className="w-full text-2xl font-bold border-b p-2 outline-none focus:border-blue-400"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="shrink-0">Slug:</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white p-4 rounded shadow">
            <label className="block text-sm font-medium mb-2">Content</label>

            {/* Tab Switch */}
            <div className="flex gap-2 mb-3 border-b">
              <button
                type="button"
                onClick={() => setEditorMode('visual')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  editorMode === 'visual'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('code')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  editorMode === 'code'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Code / HTML
              </button>
            </div>

            {editorMode === 'visual' && (
              <ReactQuill
                key="quill-editor"
                theme="snow"
                value={form.content}
                onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                modules={modules}
                className="h-96 mb-12"
              />
            )}

            {editorMode === 'code' && (
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows="16"
                className="w-full border rounded p-3 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none"
                placeholder="<p>HTML code yahan likho...</p>"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white p-4 rounded shadow">
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows="3"
              placeholder="Short description..."
              className="w-full border rounded p-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* SEO */}
          <div className="bg-white p-4 rounded shadow space-y-3">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <label className="text-sm text-gray-600">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={form.seo.metaTitle}
                onChange={handleSeoChange}
                className="w-full border rounded p-2 mt-1 text-sm focus:outline-none focus:border-blue-400"
                placeholder="SEO Title"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Meta Description</label>
              <textarea
                name="metaDescription"
                value={form.seo.metaDescription}
                onChange={handleSeoChange}
                rows="3"
                className="w-full border rounded p-2 mt-1 text-sm focus:outline-none focus:border-blue-400"
                placeholder="SEO Description"
              />
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">

          {/* Publish Box */}
          <div className="bg-white p-4 rounded shadow space-y-3">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Publish</h3>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded p-2 mt-1 focus:outline-none focus:border-blue-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Status badge preview */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Current:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                form.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {form.status}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/admin/pages')}
                className="flex-1 border rounded py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  form.status === 'published' ? 'Update & Publish' : 'Save Draft'
                )}
              </button>
            </div>
          </div>

          {/* Preview Link */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-2">Preview</h3>
            <a
              href={`/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 text-sm underline break-all hover:text-blue-700"
            >
              /{form.slug}
            </a>
          </div>

        </div>
      </form>
    </div>
  );
}

export default EditPage;