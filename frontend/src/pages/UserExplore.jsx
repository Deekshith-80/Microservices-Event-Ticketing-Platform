import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchPublicActiveEvents } from '../services/ticketApi';
import EventPreviewCard from '../components/tenant/EventPreviewCard';

export default function UserExplore() {
  const { tenantId } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchPublicActiveEvents(tenantId);
        if (response?.success) {
          setEvents(response.events || []);
        }
      } catch (eventError) {
        setError(eventError.response?.data?.error || 'Unable to load active events.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [tenantId]);

  const visibleEvents = useMemo(() => events.filter((event) => event.status === 'Active'), [events]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Audience Explorer</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Browse Live Events</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Select a manifest card to enter the booking flow and reserve tickets through the secure checkout path.
        </p>
      </div>

      {error ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="border border-zinc-950 bg-white p-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
          Loading live inventory...
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="border border-zinc-950 bg-white p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">No active events</p>
          <p className="mt-2 text-sm text-zinc-600">Once organizers publish an active event, it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventPreviewCard
              key={event._id}
              data={event}
              onClick={() => navigate(`/booking/${event._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
