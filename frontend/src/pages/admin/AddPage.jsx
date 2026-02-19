import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cmsService } from '../../services/cms.service';

function AddPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    seo: {
      metaTitle: '',
      metaDescription: '',
    }
  });
const [editorMode, setEditorMode] = useState('visual');
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSeoChange = (e) => {
    setForm({ ...form, seo: { ...form.seo, [e.target.name]: e.target.value } });
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, title, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createPage(form);
      navigate('/admin/pages');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
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

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add New Page</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">

        {/* ── Left/Main Column ── */}
        <div className="col-span-2 space-y-4">

          {/* Title */}
          <div className="bg-white p-4 rounded shadow space-y-3">
            <input
              type="text"
              name="title"
              value={form.title}
              placeholder="Page Title"
              onChange={handleTitleChange}
              className="w-full text-2xl font-bold border-b p-2 outline-none"
              required
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Slug:</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="border rounded px-2 py-1 text-sm flex-1"
              />
            </div>
          </div>

          {/* Content Editor */}
<div className="bg-white p-4 rounded shadow">
  <label className="block text-sm font-medium mb-2">Content</label>
  
  {/* Tab Switch */}
  <div className="flex gap-2 mb-2 border-b">
    <button
      type="button"
      onClick={() => setEditorMode('visual')}
      className={`px-3 py-1 text-sm ${editorMode === 'visual' 
        ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
        : 'text-gray-500'}`}
    >
      Visual
    </button>
    <button
      type="button"
      onClick={() => setEditorMode('code')}
      className={`px-3 py-1 text-sm ${editorMode === 'code' 
        ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
        : 'text-gray-500'}`}
    >
      Code / HTML
    </button>
  </div>

  {/* Visual Editor */}
  {editorMode === 'visual' && (
    <ReactQuill
      theme="snow"
      value={form.content}
      onChange={(value) => setForm({ ...form, content: value })}
      modules={modules}
      className="h-96 mb-12"
    />
  )}

  {/* Code Editor */}
  {editorMode === 'code' && (
    <textarea
      value={form.content}
      onChange={(e) => setForm({ ...form, content: e.target.value })}
      rows="16"
      className="w-full border rounded p-3 font-mono text-sm bg-gray-900 text-green-400"
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
              className="w-full border rounded p-2 text-sm"
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
                className="w-full border rounded p-2 mt-1 text-sm"
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
                className="w-full border rounded p-2 mt-1 text-sm"
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
                className="w-full border rounded p-2 mt-1"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/pages')}
                className="flex-1 border rounded py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700"
              >
                {form.status === 'published' ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>

          {/* Preview Link */}
          {form.slug && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-2">Preview</h3>
              <a
                href={`/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 text-sm underline break-all"
              >
                /{form.slug}
              </a>
            </div>
          )}

        </div>
      </form>
    </div>
  );
}

export default AddPage;