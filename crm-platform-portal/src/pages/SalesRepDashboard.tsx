import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { contactsAPI } from '../utils/api';
import type { Contact } from '../types';

export function SalesRepDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await contactsAPI.list({ limit: 50 });
      setContacts(response.data.contacts);
    } catch (err: any) {
      setError('Failed to load contacts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-900 text-green-200';
    if (score >= 50) return 'bg-yellow-900 text-yellow-200';
    return 'bg-red-900 text-red-200';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-900 text-blue-200',
      engaged: 'bg-purple-900 text-purple-200',
      qualified: 'bg-green-900 text-green-200',
      closed: 'bg-gray-700 text-gray-200',
    };
    return colors[status] || 'bg-gray-700 text-gray-200';
  };

  return (
    <DashboardLayout title="My Leads">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Leads</p>
            <p className="text-white text-2xl font-bold">{contacts.length}</p>
          </div>
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Avg Lead Score</p>
            <p className="text-white text-2xl font-bold">
              {contacts.length > 0
                ? Math.round(contacts.reduce((sum, c) => sum + c.lead_score, 0) / contacts.length)
                : 0}
            </p>
          </div>
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Qualified</p>
            <p className="text-white text-2xl font-bold">
              {contacts.filter(c => c.status === 'qualified').length}
            </p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-brand-dark border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-bold">Assigned Leads</h2>
            <p className="text-gray-400 text-sm">View your assigned leads and their progress</p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border-b border-red-700 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading leads...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No leads assigned yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-800 transition">
                      <td className="px-4 py-3 text-sm text-white">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{contact.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLeadScoreColor(contact.lead_score)}`}>
                          {contact.lead_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
