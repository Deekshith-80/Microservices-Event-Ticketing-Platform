import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

function GoogleLoginButtonEnabled({ authenticate, roleSelection, navigate, loading }) {
  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      const result = await authenticate('google', tokenResponse.access_token, roleSelection);
      if (result?.success) {
        navigate(result.user?.role === 'Customer' ? '/explore' : '/dashboard', { replace: true });
      }
    },
    onError: () => {
      console.error('Google OAuth window closed or rejected.');
    }
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold h-9 rounded-none border border-zinc-200 transition-colors cursor-pointer tracking-wide disabled:opacity-50"
    >
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black leading-none text-white"
        aria-hidden="true"
      >
        G
      </span>
      Sign In with Google
    </button>
  );
}

function GoogleLoginButtonDisabled() {
  return (
    <button
      type="button"
      disabled
      className="w-full flex items-center justify-center gap-2 bg-white text-zinc-400 text-xs font-bold h-9 rounded-none border border-zinc-200 cursor-not-allowed tracking-wide"
      title="Google sign-in is disabled until VITE_GOOGLE_CLIENT_ID is configured."
    >
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none"
        aria-hidden="true"
      >
        G
      </span>
      Google sign-in unavailable
    </button>
  );
}

export default function Login({ googleClientId }) {
  const { authenticate, error, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [roleSelection, setRoleSelection] = useState('Customer');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await authenticate(authMode, formData, roleSelection);
    if (result?.success) {
      navigate(result.user?.role === 'Customer' ? '/explore' : '/dashboard', { replace: true });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center animate-fade-in">
      
      {/* Brand Identity Stamp */}
      <div className="mb-8 flex flex-col items-center select-none">
        <div className="h-9 w-9 bg-zinc-900 flex items-center justify-center mb-3">
          <span className="font-serif font-black text-sm text-white italic">ST</span>
        </div>
        <h1 className="text-xl font-black tracking-[0.22em] text-zinc-900 uppercase">
          SHOW<span className="font-light text-zinc-400">TIME</span>
        </h1>
        <p className="text-[9px] tracking-widest text-zinc-400 uppercase mt-1 font-bold">Premium Ticket Exchange</p>
      </div>

      {error && (
        <div className="w-full mb-4 bg-zinc-900 text-white text-xs py-2.5 px-4 text-center font-medium tracking-wide">
          {error}
        </div>
      )}

      {/* Razor-Sharp Form Container */}
      <div className="w-full bg-white border border-zinc-200/80 p-8 rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        
        <div className="mb-4">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Target Access Layer</label>
          <div className="grid grid-cols-2 gap-1 bg-zinc-50 p-1 border border-zinc-200">
            <button
              type="button"
              onClick={() => setRoleSelection('Customer')}
              className={`py-1 text-[11px] font-bold transition-all cursor-pointer ${roleSelection === 'Customer' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Audience
            </button>
            <button
              type="button"
              onClick={() => setRoleSelection('TenantAdmin')}
              className={`py-1 text-[11px] font-bold transition-all cursor-pointer ${roleSelection === 'TenantAdmin' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Organizer
            </button>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
            {authMode === 'login' ? 'Portal Authentication' : 'Establish Registry'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-zinc-200 rounded-none h-9 px-3 text-xs focus:border-zinc-900 focus:outline-none bg-white transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email Coordinates</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 rounded-none h-9 px-3 text-xs focus:border-zinc-900 focus:outline-none bg-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Security Key</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-zinc-200 rounded-none h-9 px-3 text-xs focus:border-zinc-900 focus:outline-none bg-white transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold h-9 rounded-none transition-colors tracking-widest uppercase disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authorizing...' : authMode === 'login' ? 'Sign In' : 'Register Profile'}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink mx-3 text-[9px] text-zinc-300 font-bold uppercase tracking-widest select-none">or</span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        {typeof googleClientId === 'string' && googleClientId.trim().length > 0 ? (
          <GoogleLoginButtonEnabled
            authenticate={authenticate}
            roleSelection={roleSelection}
            navigate={navigate}
            loading={loading}
          />
        ) : (
          <GoogleLoginButtonDisabled />
        )}

        <div className="mt-5 text-center border-t border-zinc-100 pt-4">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            {authMode === 'login' ? "New Platform Entity? Create Account" : 'Registered? Return to Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
