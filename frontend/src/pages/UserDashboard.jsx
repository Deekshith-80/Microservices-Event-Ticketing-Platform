import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchMyTickets } from '../services/ticketApi';
import { formatCurrency, formatLocalDateTime } from '../services/showtimeApi';

const ReceiptCard = ({ ticket }) => (
  <article className="border border-zinc-950 bg-white p-4 sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Booking Reference</p>
        <h3 className="mt-2 font-mono text-lg font-bold tracking-[0.18em] text-zinc-950">{ticket.bookingReference}</h3>
      </div>
      <span className="border border-zinc-950 px-2 py-1 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-950">
        STATUS // {String(ticket.status || '').toUpperCase()}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
      <div className="border-t border-zinc-950 pt-2">
        <div>Issued</div>
        <div className="mt-1 font-mono text-[12px] font-bold tracking-normal text-zinc-950">
          {formatLocalDateTime(ticket.createdAt)}
        </div>
      </div>
      <div className="border-t border-zinc-950 pt-2">
        <div>Volume</div>
        <div className="mt-1 font-mono text-[12px] font-bold tracking-normal text-zinc-950">
          {ticket.quantity} tickets
        </div>
      </div>
      <div className="col-span-2 border-t border-zinc-950 pt-2">
        <div>Order Value</div>
        <div className="mt-1 font-mono text-[12px] font-bold tracking-normal text-zinc-950">
          {formatCurrency(ticket.totalAmount)}
        </div>
      </div>
    </div>
  </article>
);

export default function UserDashboard() {
  const { user, tenantId } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ totalSpend: 0, totalTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchMyTickets({ userId: user.id, tenantId });
        if (response?.success) {
          setTickets(response.tickets || []);
          setSummary(response.summary || { totalSpend: 0, totalTickets: 0 });
        }
      } catch (ticketError) {
        setError(ticketError.response?.data?.error || 'Unable to load ticket wallet.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [tenantId, user?.id]);

  const metrics = useMemo(() => ([
    { label: 'Lifetime Spend', value: formatCurrency(summary.totalSpend || 0) },
    { label: 'Tickets Held', value: String(summary.totalTickets || 0) },
    { label: 'Confirmed Stubs', value: String(tickets.filter((ticket) => ticket.status === 'Confirmed').length) }
  ]), [summary, tickets]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Ticket Wallet</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Reservation Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Structural ticket receipts are tracked here as confirmed wallet entries.
        </p>
      </div>

      {error ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-zinc-950 bg-white p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">{metric.label}</p>
            <p className="mt-3 text-xl font-black tracking-tight text-zinc-950">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="border border-zinc-950 bg-white p-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
            Loading wallet entries...
          </div>
        ) : tickets.length === 0 ? (
          <div className="border border-zinc-950 bg-white p-8 text-center text-sm text-zinc-600">
            No ticket stubs have been issued yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tickets.map((ticket) => (
              <ReceiptCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
