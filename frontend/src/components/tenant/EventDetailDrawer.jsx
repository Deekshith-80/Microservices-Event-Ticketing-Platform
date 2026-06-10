import React, { useEffect } from 'react';
import { formatCurrency, formatLocalDateTime } from '../../services/showtimeApi';

const MetricsRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-zinc-200 py-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500 last:border-b-0">
    <span>{label}</span>
    <span className="font-mono text-[12px] font-bold tracking-normal text-zinc-950">{value}</span>
  </div>
);

export default function EventDetailDrawer({ event, open, onClose, onCancel }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (eventKey) => {
      if (eventKey.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!event) {
    return null;
  }

  const totalCapacity = Number(event.totalCapacity) || 0;
  const ticketsSold = Number(event.ticketsSold) || 0;
  const occupancyPercent = totalCapacity > 0 ? Math.min(100, (ticketsSold / totalCapacity) * 100) : 0;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/70"
        aria-label="Close event details"
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-zinc-950 bg-white shadow-[0_32px_100px_rgba(9,9,11,0.28)] transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="sticky top-0 z-10 border-b border-zinc-950 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Event Detail Drawer</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.18em] text-zinc-950">
                {event.title || 'Untitled Manifest'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border border-zinc-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-950 transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-950 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="overflow-hidden border border-zinc-950">
            {event.bannerUrl ? (
              <img src={event.bannerUrl} alt={event.title || 'Event banner'} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-zinc-950 text-[10px] font-black uppercase tracking-[0.32em] text-white">
                Banner not provided
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-zinc-950 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Classification</p>
              <p className="mt-2 text-[14px] font-black uppercase tracking-[0.2em] text-zinc-950">{event.category || 'Other'}</p>
            </div>
            <div className="border border-zinc-950 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Lifecycle</p>
              <p className="mt-2 text-[14px] font-black uppercase tracking-[0.2em] text-zinc-950">{event.status || 'Active'}</p>
            </div>
          </div>

          <div className="border border-zinc-950 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Description</p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {event.description || 'No event description was provided.'}
            </p>
          </div>

          <div className="border border-zinc-950 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Performance Breakdown</p>
            <MetricsRow label="Scheduled" value={formatLocalDateTime(event.date) || 'Invalid date'} />
            <MetricsRow label="Location" value={event.location || 'Unknown'} />
            <MetricsRow label="Ticket Price" value={formatCurrency(event.ticketPrice)} />
            <MetricsRow label="Tickets Sold" value={String(ticketsSold)} />
            <MetricsRow label="Gross Revenue" value={formatCurrency(event.grossRevenue)} />
            <MetricsRow label="Occupancy" value={`${occupancyPercent.toFixed(1)}%`} />
          </div>

          <div className="border border-zinc-950 p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              <span>Capacity Depletion</span>
              <span className="font-mono text-[12px] font-bold text-zinc-950">
                {ticketsSold} / {totalCapacity}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden bg-zinc-200">
              <div className="h-full bg-zinc-950 transition-all duration-200" style={{ width: `${occupancyPercent}%` }} />
            </div>
          </div>

          <div className="space-y-3 border border-zinc-950 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Administrative Action</p>
            <button
              type="button"
              onClick={onCancel}
              disabled={event.status === 'Cancelled'}
              className="w-full border border-zinc-950 bg-zinc-950 px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:hover:scale-100 disabled:hover:bg-zinc-100 disabled:hover:text-zinc-400"
            >
              {event.status === 'Cancelled' ? 'Manifest Already Cancelled' : 'Cancel Manifest'}
            </button>
          </div>

          {event.logoUrl ? (
            <div className="border border-zinc-950 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Brand Stamp</p>
              <img src={event.logoUrl} alt="Event logo stamp" className="mt-3 h-20 w-20 object-contain" />
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
