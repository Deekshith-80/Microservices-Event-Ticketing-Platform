import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function OrgNavbar() {
  const { logout, tenantSettings } = useAuth();
  const navigate = useNavigate();
  const brandName = tenantSettings?.brandName?.trim() || 'SHOWTIME';

  return (
    <nav className="w-full bg-zinc-950 text-white border-b border-zinc-900 px-5 sm:px-6 h-16 flex items-center justify-between select-none">
      <div className="flex items-center gap-8">
        <span className="text-[11px] font-black tracking-[0.35em] uppercase">{brandName}</span>
        <div className="hidden sm:flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <Link to="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
          <Link to="/analytics" className="transition-colors hover:text-white">Analytics</Link>
          <Link to="/create-event" className="transition-colors hover:text-white">Create Event</Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/profile" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors hidden sm:inline-flex">Corporate Profile</Link>
        <button onClick={() => { logout(); navigate('/'); }} className="border border-zinc-700 text-zinc-300 hover:text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:scale-[1.02]">
          Disconnect
        </button>
      </div>
    </nav>
  );
}
