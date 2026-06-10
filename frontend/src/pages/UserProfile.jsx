import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchMyTickets } from '../services/ticketApi';
import { formatCurrency } from '../services/showtimeApi';

export default function UserProfile() {
  const { user, tenantId } = useAuth();
  const [summary, setSummary] = useState({ totalSpend: 0, totalTickets: 0 });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfileMetrics = async () => {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchMyTickets({ userId: user.id, tenantId });
        if (response?.success) {
          setSummary(response.summary || { totalSpend: 0, totalTickets: 0 });
          setTickets(response.tickets || []);
        }
      } catch (profileError) {
        setError(profileError.response?.data?.error || 'Unable to load profile metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileMetrics();
  }, [tenantId, user?.id]);

  const metrics = useMemo(() => ([
    { label: 'Session User ID', value: user?.id || 'Unknown' },
    { label: 'Email', value: user?.email || 'Unknown' },
    { label: 'Role', value: user?.role || 'Customer' },
    { label: 'Lifetime Spend', value: formatCurrency(summary.totalSpend || 0) },
    { label: 'Total Bookings', value: String(summary.totalTickets || 0) }
  ]), [summary, user]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">User Profile</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Account Ledger</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Session metadata and lifetime spend are exposed here for operational review.
        </p>
      </div>

      {error ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-zinc-950 bg-white p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">{metric.label}</p>
            <p className="mt-3 font-mono text-[12px] font-bold leading-6 text-zinc-950 break-all">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="border border-zinc-950 bg-zinc-950 p-5 text-white">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Identity Snapshot</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-200">
            <p>Display Name: {user?.name || 'Authenticated User'}</p>
            <p>Tenant Boundary: {tenantId}</p>
            <p>Session Scope: Secure browser cookie plus tenant header context</p>
          </div>
        </div>

        <div className="border border-zinc-950 bg-white p-5">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Recent Ticket Count</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-zinc-950">{tickets.length}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            A compact ledger of confirmed and pending reservations is maintained in the ticket wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
