import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Download } from 'lucide-react';

function UserDownloads() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-downloads'],
    queryFn: userService.getMyDownloads
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const downloads = data?.downloads || [];

  // ✅ SAFE DOWNLOAD HANDLER (NO CORRUPTION)
  const handleDownload = async (licenseId, fileName) => {
    try {
      const blob = await userService.downloadFile(licenseId);

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: 'application/zip' })
      );

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('File download failed');
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">My Downloads</h1>

      {downloads.length === 0 ? (
        <p className="text-gray-600">No downloads yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((license) => (
            <div
              key={license._id}
              className="border p-4 rounded-lg flex flex-col items-start"
            >
              <img
                src={license.product?.thumbnail || '/placeholder.jpg'}
                alt={license.product?.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />

              <h3 className="font-semibold text-lg mb-2">
                {license.product?.title}
              </h3>

              <p className="text-gray-600 mb-2">
                <span className="font-medium">License:</span>{' '}
                {license.licenseKey}
              </p>

              {license.product?.files?.length > 0 ? (
                license.product.files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleDownload(license._id, file.name)
                    }
                    className="mt-2 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    <Download className="mr-2 w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-200 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No files available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDownloads;
