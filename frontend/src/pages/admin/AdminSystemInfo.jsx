import { useEffect, useState } from 'react';
import { 
  Server, 
  Package, 
  Cpu, 
  HardDrive, 
  Clock, 
  Monitor,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminSystemInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    backendDeps: false,
    backendDevDeps: false,
    frontendDeps: false,
    frontendDevDeps: false,
  });
  const [searchTerms, setSearchTerms] = useState({
    backendDeps: '',
    backendDevDeps: '',
    frontendDeps: '',
    frontendDevDeps: '',
  });

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const response = await fetch('/api/system/system-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setData(result);
      setDebugInfo({
        status: 'success',
        timestamp: new Date().toISOString(),
        backendPackagesCount: Object.keys(result.backend?.dependencies || {}).length,
        frontendPackagesCount: Object.keys(result.frontend?.dependencies || {}).length,
      });
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      setDebugInfo({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test API connectivity
  const testConnection = async () => {
    try {
      const response = await fetch('/api/system/test');
      const result = await response.json();
      alert('API connection successful!\n' + JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('❌ Test failed:', err);
      alert('API connection failed!\n' + err.message);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const filterPackages = (packages, searchTerm) => {
    if (!searchTerm) return packages;
    return Object.entries(packages).filter(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const PackageList = ({ packages, section, title }) => {
    const isExpanded = expandedSections[section];
    const searchTerm = searchTerms[section];
    const filteredPackages = filterPackages(packages, searchTerm);
    const packageCount = Object.keys(packages).length;

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection(section)}
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{packageCount} packages</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {isExpanded && (
          <div className="border-t border-slate-200">
            {/* Search bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerms(prev => ({
                    ...prev,
                    [section]: e.target.value
                  }))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Package list */}
            <div className="max-h-96 overflow-y-auto">
              {filteredPackages.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredPackages.map(([pkg, ver]) => (
                    <div key={pkg} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">{pkg}</span>
                      <span className="text-sm text-slate-500 font-mono">{ver}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No packages found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600">Loading system information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="text-red-600 text-lg font-semibold mb-2">Failed to Load System Info</div>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              
              {/* Debug Info */}
              {debugInfo && (
                <div className="bg-red-100 rounded-lg p-4 mb-4">
                  <div className="text-xs font-mono text-red-800">
                    <div><strong>Status:</strong> {debugInfo.status}</div>
                    <div><strong>Time:</strong> {debugInfo.timestamp}</div>
                    <div><strong>Error:</strong> {debugInfo.error}</div>
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="bg-white rounded-lg p-4 mb-4 text-sm text-slate-700">
                <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check if backend server is running</li>
                  <li>Verify route is registered: <code className="bg-slate-100 px-1 rounded">/api/system/system-info</code></li>
                  <li>Check browser console for errors (F12)</li>
                  <li>Verify you're logged in as admin</li>
                  <li>Check network tab for request details</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchSystemInfo}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={testConnection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No system information available</p>
          <button
            onClick={fetchSystemInfo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Information</h1>
          <p className="text-slate-600">Server configuration and package details</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Test API
          </button>
          <button
            onClick={fetchSystemInfo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-xs font-mono text-blue-900">
            <strong>Debug Info:</strong> {JSON.stringify(debugInfo, null, 2)}
          </div>
        </div>
      )}

      {/* System Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8" />
            <span className="text-blue-100 text-sm">System</span>
          </div>
          <div className="text-2xl font-bold mb-1">{data.appName}</div>
          <div className="text-blue-100 text-sm">Version {data.appVersion}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8" />
            <span className="text-green-100 text-sm">Node.js</span>
          </div>
          <div className="text-2xl font-bold mb-1">{data.nodeVersion}</div>
          <div className="text-green-100 text-sm">{data.platform} ({data.architecture})</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8" />
            <span className="text-purple-100 text-sm">Memory</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatBytes(data.memoryUsage?.heapUsed || 0)}
          </div>
          <div className="text-purple-100 text-sm">
            / {formatBytes(data.memoryUsage?.heapTotal || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <span className="text-orange-100 text-sm">Uptime</span>
          </div>
          <div className="text-2xl font-bold mb-1">{formatUptime(data.uptime || 0)}</div>
          <div className="text-orange-100 text-sm">{data.env} mode</div>
        </div>
      </div>

      {/* Backend Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Server className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Backend</h2>
            <p className="text-sm text-slate-600">{data.backend?.description || 'Node.js Backend'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <PackageList
            packages={data.backend?.dependencies || {}}
            section="backendDeps"
            title="Dependencies"
          />
          <PackageList
            packages={data.backend?.devDependencies || {}}
            section="backendDevDeps"
            title="Dev Dependencies"
          />
        </div>
      </div>

      {/* Frontend Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Monitor className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Frontend</h2>
            <p className="text-sm text-slate-600">{data.frontend?.description || 'React Frontend'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <PackageList
            packages={data.frontend?.dependencies || {}}
            section="frontendDeps"
            title="Dependencies"
          />
          <PackageList
            packages={data.frontend?.devDependencies || {}}
            section="frontendDevDeps"
            title="Dev Dependencies"
          />
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `system-info-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export System Info
        </button>
      </div>
    </div>
  );
}