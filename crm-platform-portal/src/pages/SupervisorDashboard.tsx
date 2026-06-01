import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { contactsAPI } from '../utils/api';
import type { Contact } from '../types';

interface TeamMember {
  id: string;
  name: string;
  assignedLeads: Contact[];
  totalLeads: number;
}

export function SupervisorDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await contactsAPI.list({ limit: 200 });
      setContacts(response.data.contacts);
      buildTeamDistribution(response.data.contacts);
    } catch (err: any) {
      console.error('Failed to load contacts', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildTeamDistribution = (contactList: Contact[]) => {
    const distribution = new Map<string, Contact[]>();

    contactList.forEach((contact) => {
      const assignedTo = contact.assigned_to || 'unassigned';
      if (!distribution.has(assignedTo)) {
        distribution.set(assignedTo, []);
      }
      distribution.get(assignedTo)!.push(contact);
    });

    const members: TeamMember[] = Array.from(distribution.entries()).map(([id, leads]) => ({
      id,
      name: id === 'unassigned' ? 'Unassigned' : id,
      assignedLeads: leads,
      totalLeads: leads.length,
    }));

    setTeamMembers(members.sort((a, b) => b.totalLeads - a.totalLeads));
  };

  const handleExportPhones = async () => {
    try {
      setExportLoading(true);
      await contactsAPI.exportPhones();

      // Create CSV from contacts
      const csv = [
        ['Phone', 'First Name', 'Last Name', 'Email', 'Lead Score'],
        ...contacts.map((c) => [c.phone, c.first_name, c.last_name, c.email, c.lead_score]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crm-leads-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      setShowExportModal(false);
    } catch (err) {
      console.error('Failed to export phone numbers', err);
    } finally {
      setExportLoading(false);
    }
  };

  const getAvgScore = (leads: Contact[]) => {
    if (leads.length === 0) return 0;
    return Math.round(leads.reduce((sum, c) => sum + c.lead_score, 0) / leads.length);
  };

  return (
    <DashboardLayout title="Team Dashboard">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Leads</p>
            <p className="text-white text-2xl font-bold">{contacts.length}</p>
          </div>
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Team Members</p>
            <p className="text-white text-2xl font-bold">{teamMembers.length}</p>
          </div>
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Avg Score</p>
            <p className="text-white text-2xl font-bold">
              {contacts.length > 0 ? getAvgScore(contacts) : 0}
            </p>
          </div>
          <div className="bg-brand-dark border border-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full bg-brand-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
            >
              Export Phones
            </button>
          </div>
        </div>

        {/* Team Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-brand-dark border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">{member.name}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-sm">Assigned Leads</span>
                    <span className="text-white font-bold">{member.totalLeads}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div
                      className="bg-brand-accent h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((member.totalLeads / Math.max(...teamMembers.map(m => m.totalLeads), 10)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Avg Score</p>
                    <p className="text-white font-bold">{getAvgScore(member.assignedLeads)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Qualified</p>
                    <p className="text-white font-bold">
                      {member.assignedLeads.filter((c) => c.status === 'qualified').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Leads List */}
        <div className="bg-brand-dark border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-bold">All Leads</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading data...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No leads in system</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-800 transition">
                      <td className="px-4 py-3 text-sm text-white">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200">
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{contact.lead_score}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {contact.assigned_to || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-dark border border-gray-700 rounded-lg max-w-sm w-full p-6">
            <h3 className="text-white text-lg font-bold mb-4">Export Phone Numbers</h3>
            <p className="text-gray-400 mb-6">
              Export all {contacts.length} phone numbers in CSV format for Meta Ads LKL campaigns.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 text-gray-300 hover:text-white border border-gray-700 rounded transition"
                disabled={exportLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleExportPhones}
                className="flex-1 px-4 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded transition disabled:opacity-50"
                disabled={exportLoading}
              >
                {exportLoading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
