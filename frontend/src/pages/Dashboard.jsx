import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout, initializing } = useAuth();
  const navigate = useNavigate();

  if (initializing) {
    return (
      <div className="w-full max-w-sm border border-zinc-200 bg-white p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
          Verifying Session
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Holding the dashboard until the auth service confirms the cookie.
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-none text-center">
      <div className="w-10 h-10 bg-zinc-900 text-white font-black text-xs flex items-center justify-center mx-auto mb-4">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-sm font-bold text-zinc-900">{user.name}</h3>
      <p className="text-zinc-400 text-xs mb-6">{user.email}</p>

      <div className="mb-6 bg-zinc-50 border border-zinc-200 p-3 text-left font-mono text-[10px] text-zinc-500 space-y-1">
        <div>Scope Identifier: {user.role}</div>
        <div>Persistence Context: JWT Secure Cookie</div>
      </div>

      <button
        onClick={async () => {
          await logout();
          navigate('/', { replace: true });
        }}
        className="w-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-semibold h-9 rounded-none transition-colors cursor-pointer"
      >
        Disconnect Session
      </button>
    </div>
  );
}
