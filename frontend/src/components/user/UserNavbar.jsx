import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function UserNavbar() {
  const { logout, tenantSettings, user } = useAuth();
  const navigate = useNavigate();
  const brandName = tenantSettings?.brandName?.trim() || 'SHOWTIME';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="w-full border-b border-zinc-950 bg-white px-4 sm:px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/explore" className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-950">
            {brandName}
          </Link>
          <div className="hidden md:flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            <Link to="/explore" className="transition-colors duration-200 hover:text-zinc-950">Explore</Link>
            <Link to="/dashboard" className="transition-colors duration-200 hover:text-zinc-950">Dashboard</Link>
            <Link to="/profile" className="transition-colors duration-200 hover:text-zinc-950">Profile</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Session</p>
            <p className="mt-1 font-mono text-[11px] text-zinc-950">{user?.email || 'Authenticated'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-zinc-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 transition-all duration-200 hover:bg-zinc-950 hover:text-white hover:scale-[1.01]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
