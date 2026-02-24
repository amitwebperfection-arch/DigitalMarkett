import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      
      {/* Image */}
      <img 
        src="/404-error.jpg" 
        alt="404 Page Not Found"
        className="w-full max-w-md mb-6"
      />

      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
      >
        <Home className="mr-2 w-5 h-5" />
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;