import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cancelOrganizerEvent, fetchOrganizerEvents, formatCurrency, formatLocalDateTime } from '../services/showtimeApi';
import EventPreviewCard from '../components/tenant/EventPreviewCard';
import EventDetailDrawer from '../components/tenant/EventDetailDrawer';

export default function OrgDashboard() {
  const { user, tenantId, tenantSettings } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEvent, setActiveEvent] = useState(null);

  const loadEvents = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchOrganizerEvents({ tenantId, organizerId: user.id });
      if (response?.success) {
        setEvents(response.events || []);
      } else {
        setEvents([]);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Unable to load event registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [tenantId, user?.id]);

  const analytics = useMemo(() => {
    const totalEvents = events.length;
    const activeEvents = events.filter((event) => event.status === 'Active').length;
    const grossRevenue = events.reduce((sum, event) => sum + (Number(event.grossRevenue) || 0), 0);
    const ticketsSold = events.reduce((sum, event) => sum + (Number(event.ticketsSold) || 0), 0);
    const occupancy = events.reduce((sum, event) => sum + (Number(event.totalCapacity) || 0), 0);
    const occupancyRatio = occupancy > 0 ? (ticketsSold / occupancy) * 100 : 0;

    return [
      { label: 'Published Events', value: totalEvents.toString() },
      { label: 'Active Events', value: activeEvents.toString() },
      { label: 'Gross Revenue', value: formatCurrency(grossRevenue) },
      { label: 'Occupancy Ratio', value: `${occupancyRatio.toFixed(1)}%` }
    ];
  }, [events]);

  const handleCancel = async (eventId) => {
    if (!window.confirm('Cancel this manifest and freeze its lifecycle state?')) {
      return;
    }

    try {
      const response = await cancelOrganizerEvent(eventId, tenantId);
      if (response?.success) {
        setActiveEvent((current) => (current?._id === eventId ? { ...current, status: 'Cancelled' } : current));
        await loadEvents();
      }
    } catch (cancelError) {
      setError(cancelError.response?.data?.error || 'Cancellation failed.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-950 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
            Command Post
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">
            Event Operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            {tenantSettings?.brandName || 'SHOWTIME'} is managing organizer-scoped manifests with full tenant isolation and zero shared-state leakage.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Session</p>
          <p className="mt-2 font-mono text-sm font-bold text-zinc-950">{user?.email || 'Session linked'}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.map((metric) => (
          <div key={metric.label} className="border border-zinc-950 bg-white p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">{metric.label}</p>
            <p className="mt-3 text-xl font-black tracking-tight text-zinc-950">{metric.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mt-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      <div className="mt-8">
        {loading ? (
          <div className="border border-zinc-950 bg-white p-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
            Loading manifest grid...
          </div>
        ) : events.length === 0 ? (
          <div className="border border-zinc-950 bg-white p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">No events published</p>
            <p className="mt-2 text-sm text-zinc-600">
              Once a profile is complete, new manifests will appear here as premium event cards.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventPreviewCard
                key={event._id}
                data={event}
                onClick={() => setActiveEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      <EventDetailDrawer
        event={activeEvent}
        open={Boolean(activeEvent)}
        onClose={() => setActiveEvent(null)}
        onCancel={() => activeEvent && handleCancel(activeEvent._id)}
      />

      <div className="mt-8 border-t border-zinc-950 pt-4 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        Localized snapshot updated at {formatLocalDateTime(new Date().toISOString())}
      </div>
    </div>
  );
}
