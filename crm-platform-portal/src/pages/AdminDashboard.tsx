import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { usersAPI } from '../utils/api';
import type { User } from '../types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'sales_rep'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await usersAPI.list({ limit: 50 });
      setUsers(response.data);
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required');
      return;
    }

    try {
      await usersAPI.create({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role
      });
      setSuccess('User created successfully');
      setFormData({ email: '', password: '', fullName: '', role: 'sales_rep' });
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(userId);
      setSuccess('User deleted successfully');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <DashboardLayout title="Admin Panel">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'companies', label: 'Companies' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'text-brand-accent border-b-2 border-brand-accent'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Leads</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Active Companies</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">System Status</p>
                <p className="text-green-400 text-2xl font-bold">Healthy</p>
              </div>
            </div>

            <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">System Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">API Status</span>
                  <span className="text-green-400">Running</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Database</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Last Backup</span>
                  <span className="text-gray-300">Today at 12:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Create User Form */}
            <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Create New User</h3>
              {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded mb-4">{error}</div>}
              {success && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-2 rounded mb-4">{success}</div>}
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                    >
                      <option value="sales_rep">Sales Rep</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-brand-accent hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition"
                >
                  Create User
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Existing Users</h3>
              {loadingUsers ? (
                <p className="text-gray-400">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-400">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900">
                          <td className="py-3 px-4 text-white">{user.full_name}</td>
                          <td className="py-3 px-4 text-gray-300">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-900 text-red-100' :
                              user.role === 'manager' ? 'bg-purple-900 text-purple-100' :
                              'bg-blue-900 text-blue-100'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.active ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'
                            }`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 font-medium text-sm transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Manage Companies</h3>
              <button className="bg-brand-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition">
                Add Company
              </button>
            </div>
            <p className="text-gray-400">Multi-tenant company management coming soon</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  defaultValue="Marc CRM Platform"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  defaultValue="support@example.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-accent"
                />
              </div>
              <button className="bg-brand-accent hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
