import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Loader2 } from 'lucide-react';

const ACTION_LABELS = {
  LIST_TRAVELERS: 'Listed travelers',
  ADD_COMPANION: 'Added companion',
  UPDATE_TRAVELER: 'Updated traveler',
  REMOVE_COMPANION: 'Removed companion',
  VIEW_DOCUMENTS: 'Viewed documents',
  UPLOAD_DOCUMENT: 'Uploaded document',
  DELETE_DOCUMENT: 'Deleted document',
};

export default function DocumentAccessLogsScreen() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['document-access-logs'],
    queryFn: () => api.get('/admin/bookings/document-access-logs').then((res) => res.data),
  });

  return (
    <DashboardLayout title="Document Access Logs">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Sensitive Document Access Audit Trail</h2>
        <p className="text-fg/60">
          Every view, upload, or deletion of a pilgrim's travel documents by an admin is recorded here (NDPA/GDPR accountability).
        </p>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : logs.length === 0 ? (
          <p className="text-center py-10 text-fg/50 text-sm">No access events recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg/50 border-b border-border">
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Traveler</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50">
                  <td className="px-4 py-3">{log.adminEmail}</td>
                  <td className="px-4 py-3">{ACTION_LABELS[log.action] || log.action}</td>
                  <td className="px-4 py-3">{log.bookingId || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.travelerId ? log.travelerId.slice(0, 8) : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.docId ? log.docId.slice(0, 8) : '—'}</td>
                  <td className="px-4 py-3 text-fg/60">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
