import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchOrganizerAnalytics, formatCurrency } from '../services/showtimeApi';

const MetricPanel = ({ label, value, tone = 'light' }) => (
  <div className={`border border-zinc-950 p-4 ${tone === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'}`}>
    <p className={`text-[9px] font-black uppercase tracking-[0.35em] ${tone === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
    <p className="mt-3 text-xl font-black tracking-tight">{value}</p>
  </div>
);

function RevenueBarChart({ items }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const maxRevenue = Math.max(...items.map((item) => Number(item.grossRevenue) || 0), 1);

  return (
    <div className="border border-zinc-950 bg-white p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Widget A</p>
          <h3 className="mt-2 text-lg font-black uppercase tracking-[0.18em] text-zinc-950">Event Revenue Performance</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Event Title vs Realized Revenue</p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="flex h-56 items-center justify-center border border-dashed border-zinc-300 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            No revenue samples available
          </div>
        ) : items.map((item, index) => {
          const width = `${Math.max(8, ((Number(item.grossRevenue) || 0) / maxRevenue) * 100)}%`;
          const isActive = hoverIndex === index;

          return (
            <button
              key={`${item.title}-${item.grossRevenue}-${index}`}
              type="button"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                <span className="truncate">{item.title}</span>
                <span className="font-mono text-zinc-950">{formatCurrency(item.grossRevenue)}</span>
              </div>
              <div className="mt-2 h-4 border border-zinc-950 bg-zinc-100">
                <div
                  className={`h-full transition-all duration-200 ${isActive ? 'bg-zinc-950' : 'bg-zinc-700'}`}
                  style={{ width }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPieChart({ items }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const total = items.reduce((sum, item) => sum + (Number(item.ticketVolume) || 0), 0);
  const size = 220;
  const center = size / 2;
  const radius = 78;
  let runningAngle = -90;

  const arcs = items.map((item, index) => {
    const value = Number(item.ticketVolume) || 0;
    const percent = total > 0 ? value / total : 0;
    const sweep = percent * 360;
    const startAngle = runningAngle;
    const endAngle = runningAngle + sweep;
    runningAngle = endAngle;

    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = sweep > 180 ? 1 : 0;

    return {
      ...item,
      index,
      percent,
      path: `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
    };
  });

  return (
    <div className="border border-zinc-950 bg-white p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Widget B</p>
          <h3 className="mt-2 text-lg font-black uppercase tracking-[0.18em] text-zinc-950">Ticket Volume Mix</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Movies vs Concerts vs Theater</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="relative mx-auto h-[220px] w-[220px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
            <circle cx={center} cy={center} r={radius} className="fill-none stroke-zinc-200" strokeWidth="38" />
            {arcs.map((arc) => (
              <path
                key={arc.category}
                d={arc.path}
                fill={palette[arc.index % palette.length]}
                opacity={hoverIndex === null || hoverIndex === arc.index ? 1 : 0.35}
                onMouseEnter={() => setHoverIndex(arc.index)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer transition-opacity duration-200"
              />
            ))}
            <text x="50%" y="48%" textAnchor="middle" className="fill-zinc-950 text-[18px] font-black">
              {total}
            </text>
            <text x="50%" y="58%" textAnchor="middle" className="fill-zinc-500 text-[7px] font-black uppercase tracking-[0.3em]">
              Tickets
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center border border-dashed border-zinc-300 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              No category data available
            </div>
          ) : items.map((item, index) => (
            <button
              key={item.category}
              type="button"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              className="flex w-full items-center justify-between gap-4 border border-zinc-950 px-4 py-3 text-left transition-colors duration-200 hover:bg-zinc-950 hover:text-white"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">{item.category}</span>
              <span className="font-mono text-[12px] font-bold">{item.ticketVolume}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const palette = ['#09090b', '#52525b', '#a1a1aa', '#d4d4d8'];

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians)
  };
}

export default function OrgAnalytics() {
  const { user, tenantId } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchOrganizerAnalytics({ tenantId, organizerId: user.id });
        if (response?.success) {
          setMetrics(response.analytics || null);
        }
      } catch (analyticsError) {
        setError(analyticsError.response?.data?.error || 'Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [tenantId, user?.id]);

  const metricPanels = [
    { label: 'Global Published Events', value: metrics?.globalPublishedEventsCount ?? 0 },
    { label: 'Active Events', value: metrics?.activeEventsCount ?? 0 },
    { label: 'Tickets Sold', value: metrics?.sumTicketsSold ?? 0 },
    { label: 'Gross Revenue', value: formatCurrency(metrics?.sumGrossRevenue ?? 0), tone: 'dark' },
    { label: 'Occupancy Ratio', value: `${Number(metrics?.occupancyRatioPercentage ?? 0).toFixed(2)}%` }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Executive Telemetry</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Analytics Control Surface</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Real-time aggregation is computed directly in MongoDB for tenant-scoped operational clarity.
        </p>
      </div>

      {error ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="border border-zinc-950 bg-white p-8 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
          Loading telemetry grid...
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metricPanels.map((metric) => (
              <MetricPanel key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <RevenueBarChart items={metrics?.revenueByEvent || []} />
            <CategoryPieChart items={metrics?.categoryDistribution || []} />
          </div>
        </>
      )}
    </div>
  );
}
