import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';

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
    if (window.confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">CMS Pages</h2>
        <Link to="/admin/pages/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add New Page
        </Link>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="text-left border-b bg-gray-50">
            <th className="p-3">Title</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.pages?.map((page) => (
            <tr key={page._id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{page.title}</td>
              <td className="p-3 text-gray-500 text-sm">/{page.slug}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  page.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {page.status}
                </span>
              </td>
              <td className="p-3 text-sm text-gray-500">
                {new Date(page.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3 flex gap-3">
                <Link to={`/admin/pages/edit/${page._id}`} className="text-blue-600 text-sm hover:underline">
                  Edit
                </Link>
                <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="text-green-600 text-sm hover:underline">
                  View
                </a>
                <button
                  onClick={() => handleDelete(page._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CmsPages;