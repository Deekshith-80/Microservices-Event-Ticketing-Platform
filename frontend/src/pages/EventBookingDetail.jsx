import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createTicketOrder,
  fetchPublicEventById,
  verifyTicketPayment
} from '../services/ticketApi';
import { formatCurrency, formatLocalDateTime } from '../services/showtimeApi';

const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SymOmUg6RB2DZr').trim();

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load checkout script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load checkout script.'));
    document.head.appendChild(script);
  });

export default function EventBookingDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchPublicEventById(eventId, tenantId);
        if (response?.success) {
          setEvent(response.event);
        }
      } catch (detailError) {
        setError(detailError.response?.data?.error || 'Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, tenantId]);

  const availableSeats = useMemo(() => {
    if (!event) {
      return 0;
    }

    return Math.max(0, Number(event.totalCapacity || 0) - Number(event.ticketsSold || 0));
  }, [event]);

  const ticketTotal = useMemo(() => {
    const unitPrice = Number(event?.ticketPrice || 0);
    return unitPrice * quantity;
  }, [event, quantity]);

  const handleCheckout = async () => {
    if (!user?.id || !event) {
      return;
    }

    if (availableSeats < quantity) {
      setError('Requested quantity exceeds remaining inventory.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await loadRazorpayScript();
      const orderResponse = await createTicketOrder({
        eventId: event._id,
        quantity,
        userId: user.id,
        tenantId
      });

      if (!orderResponse?.success) {
        throw new Error('Unable to create payment order.');
      }

      const checkout = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Showtime',
        description: event.title,
        order_id: orderResponse.orderId,
        handler: async (responsePayload) => {
          try {
            const verifyResponse = await verifyTicketPayment({
              razorpay_order_id: responsePayload.razorpay_order_id,
              razorpay_payment_id: responsePayload.razorpay_payment_id,
              razorpay_signature: responsePayload.razorpay_signature,
              tenantId
            });

            if (verifyResponse?.success) {
              navigate('/dashboard', { replace: true });
              return;
            }

            setError(verifyResponse?.error || 'Payment verification failed.');
          } catch (verifyError) {
            setError(verifyError.response?.data?.error || 'Payment verification failed.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#09090b'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      });

      checkout.on('payment.failed', (response) => {
        setProcessing(false);
        setError(response?.error?.description || 'Checkout was rejected.');
      });

      checkout.open();
    } catch (checkoutError) {
      setProcessing(false);
      setError(checkoutError.message || 'Checkout could not be initialized.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="border border-zinc-950 bg-white p-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error || 'Event not found.'}
        </div>
      </div>
    );
  }

  const isSoldOut = availableSeats < 1;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Booking Detail</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">{event.title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Confirm your seat allocation and continue to secure payment.
        </p>
      </div>

      {error ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="overflow-hidden border border-zinc-950 bg-white">
          <div className="relative min-h-[420px] bg-zinc-950 text-white">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.18),rgba(9,9,11,0.82))]" />
            <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="border border-white/20 bg-zinc-950/80 px-2 py-1 text-[9px] font-black tracking-[0.35em] uppercase">
                  {event.category}
                </span>
                <span className="border border-white/20 bg-white/90 px-2 py-1 text-[9px] font-black tracking-[0.3em] uppercase text-zinc-950">
                  {event.status}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-300">Schedule</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatLocalDateTime(event.date)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-300">Location</p>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-200">{event.location}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-300">Description</p>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-200">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-zinc-950 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-950 pb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Purchase Calculator</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.18em] text-zinc-950">Ticket Allocation</h2>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Inventory</p>
              <p className="mt-1 font-mono text-sm font-bold text-zinc-950">{availableSeats} left</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border border-zinc-950 px-4 py-3">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-10 w-10 border border-zinc-950 text-[16px] font-black leading-none transition-all duration-200 hover:bg-zinc-950 hover:text-white"
            >
              -
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Quantity</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{quantity}</p>
            </div>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(availableSeats, current + 1))}
              disabled={quantity >= availableSeats}
              className="h-10 w-10 border border-zinc-950 text-[16px] font-black leading-none transition-all duration-200 hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-300 disabled:hover:bg-white disabled:hover:text-zinc-300"
            >
              +
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="border border-zinc-950 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Unit Price</p>
              <p className="mt-2 font-mono text-lg font-bold text-zinc-950">{formatCurrency(event.ticketPrice)}</p>
            </div>
            <div className="border border-zinc-950 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Line Total</p>
              <p className="mt-2 font-mono text-lg font-bold text-zinc-950">{formatCurrency(ticketTotal)}</p>
            </div>
            <div className="col-span-2 border border-zinc-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Seat Check</span>
                <span className="font-mono text-[12px] font-bold text-zinc-950">
                  {quantity} x {formatCurrency(event.ticketPrice)}
                </span>
              </div>
            </div>
          </div>

          {isSoldOut ? (
            <div className="mt-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
              This event is currently out of inventory.
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={processing || isSoldOut}
            className="mt-6 w-full border border-zinc-950 bg-zinc-950 px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            {processing ? 'Launching Checkout...' : 'Proceed to Secure Checkout'}
          </button>
        </section>
      </div>
    </div>
  );
}
