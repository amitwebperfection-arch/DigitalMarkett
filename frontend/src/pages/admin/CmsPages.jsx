import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';
import { FileText, Plus, Eye, Edit2, Trash2, Globe } from 'lucide-react';

function CmsPages() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => cmsService.getAllPages(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => cmsService.deletePage(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-pages']),
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      deleteMutation.mutate(id);
    }
  };

  const pages = data?.data?.pages || [];

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CMS Pages</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pages.length} pages total</p>
          </div>
          <Link
            to="/admin/pages/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} /> Add New Page
          </Link>
        </div>

        {pages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">No pages found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first CMS page</p>
            <Link to="/admin/pages/new" className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={14} /> Create Page
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="sm:hidden space-y-3">
              {pages.map((page) => (
                <div key={page._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{page.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Globe size={10} /> /{page.slug}
                      </p>
                    </div>
                    <span className={`ml-2 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FileText size={10} /> {new Date(page.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/pages/edit/${page._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 size={15} />
                      </Link>
                      <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="View">
                        <Eye size={15} />
                      </a>
                      <button onClick={() => handleDelete(page._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"
                        disabled={deleteMutation.isPending}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Title', 'Slug', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pages.map((page) => (
                      <tr key={page._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{page.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">/{page.slug}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500">{new Date(page.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Link to={`/admin/pages/edit/${page._id}`} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                              <Edit2 size={13} /> Edit
                            </Link>
                            <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="text-green-600 text-sm hover:underline flex items-center gap-1">
                              <Eye size={13} /> View
                            </a>
                            <button onClick={() => handleDelete(page._id)} className="text-red-500 text-sm hover:underline flex items-center gap-1" disabled={deleteMutation.isPending}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CmsPages;