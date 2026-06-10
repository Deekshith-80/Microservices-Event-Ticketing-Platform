import React from 'react';
import { formatCurrency, formatLocalDateTime } from '../../services/showtimeApi';

const CATEGORY_LABELS = {
  Movie: 'MOVIE',
  Concert: 'CONCERT',
  Theater: 'THEATER',
  Other: 'OTHER'
};

export default function EventPreviewCard({ data, onClick }) {
  const event = data || {};
  const totalCapacity = Number(event.totalCapacity) || 0;
  const ticketsSold = Number(event.ticketsSold) || 0;
  const occupancyPercent = totalCapacity > 0 ? Math.min(100, (ticketsSold / totalCapacity) * 100) : 0;
  const categoryLabel = CATEGORY_LABELS[event.category] || 'OTHER';
  const localizedDate = formatLocalDateTime(event.date);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full overflow-hidden border border-zinc-950 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(9,9,11,0.08)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title || 'Event banner'}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-end justify-between bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_36%),linear-gradient(135deg,#09090b_0%,#27272a_100%)] p-4 text-white">
            <span className="text-[10px] font-black tracking-[0.35em] uppercase">Showtime</span>
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">No banner supplied</span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="border border-white/20 bg-zinc-950/80 px-2 py-1 text-[9px] font-black tracking-[0.3em] text-white">
            {categoryLabel}
          </span>
          <span className="border border-white/20 bg-white/90 px-2 py-1 text-[9px] font-black tracking-[0.25em] text-zinc-950">
            {event.status || 'ACTIVE'}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-zinc-950/90 px-3 py-3 text-white">
          <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.28em] text-zinc-400">
            <span>{event.location || 'Location pending'}</span>
            <span>{localizedDate || 'Date pending'}</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-white transition-all duration-200"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-[15px] font-black uppercase tracking-[0.18em] text-zinc-950">
            {event.title || 'Untitled Manifest'}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-5 text-zinc-500">
            {event.description || 'No description available for this event.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <div className="border-t border-zinc-950 pt-2">
            <div>Ticket Price</div>
            <div className="mt-1 font-mono text-[13px] font-bold text-zinc-950">{formatCurrency(event.ticketPrice)}</div>
          </div>
          <div className="border-t border-zinc-950 pt-2">
            <div>Gross Revenue</div>
            <div className="mt-1 font-mono text-[13px] font-bold text-zinc-950">{formatCurrency(event.grossRevenue)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-950 pt-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Capacity
            <div className="mt-1 font-mono text-[13px] font-bold text-zinc-950">
              {ticketsSold} / {totalCapacity}
            </div>
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Occupancy
            <div className="mt-1 font-mono text-[13px] font-bold text-zinc-950">
              {occupancyPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
