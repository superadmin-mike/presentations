import { useNavigate } from 'react-router-dom';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-white text-5xl font-bold mb-4">403</h1>
        <p className="text-gray-400 text-lg mb-8">Access Denied</p>
        <p className="text-gray-500 mb-8">You don't have permission to access this resource.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-brand-accent hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
