import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createOrganizerEvent,
  fetchTenantSettings,
  formatCurrency,
  formatLocalDateTime
} from '../services/showtimeApi';

const EMPTY_EVENT = {
  title: '',
  description: '',
  category: 'Movie',
  location: '',
  date: '',
  ticketPrice: '',
  totalCapacity: '',
  bannerUrl: '',
  logoUrl: ''
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to encode the selected asset.'));
    reader.readAsDataURL(file);
  });

export default function OrgCreateEvent() {
  const { user, tenantId } = useAuth();
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(true);
  const [profileLabel, setProfileLabel] = useState('Checking profile status...');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState(EMPTY_EVENT);
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfileLock = async () => {
      try {
        const response = await fetchTenantSettings(tenantId);
        if (response?.success) {
          const profile = response.settings || {};
          const complete = Boolean(profile.isProfileComplete);
          setIsLocked(!complete);
          setProfileLabel(complete ? 'Profile verified' : 'Profile incomplete');
        }
      } catch (error) {
        setIsLocked(true);
        setProfileLabel(error.response?.data?.error || 'Unable to resolve tenant profile.');
      }
    };

    loadProfileLock();
  }, [tenantId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const encoded = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, [field]: encoded }));

      if (field === 'bannerUrl') {
        setBannerPreview(String(encoded));
      }

      if (field === 'logoUrl') {
        setLogoPreview(String(encoded));
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        organizerId: user?.id,
        ticketPrice: Number(formData.ticketPrice),
        totalCapacity: Number(formData.totalCapacity)
      };

      const response = await createOrganizerEvent(payload, tenantId);
      if (response?.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Error compiling manifest matrix parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="w-full max-w-3xl border border-zinc-950 bg-zinc-950 p-6 text-white">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Factory Lock Engaged</p>
        <h2 className="mt-3 text-xl font-black uppercase tracking-[0.18em]">Event Creation Disabled</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
          The organizer profile is not yet complete. Finish the verification ledger before publishing a new manifest.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="border border-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white transition-all duration-200 hover:scale-[1.02] hover:bg-white hover:text-zinc-950"
          >
            Complete Profile
          </button>
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">{profileLabel}</span>
        </div>
      </div>
    );
  }

  const previewDate = formatLocalDateTime(formData.date);
  const previewPrice = formatCurrency(formData.ticketPrice || 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Manifest Factory</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Compile New Event</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Base64 assets are encoded directly from the browser and persisted into the event document as supplied, without intermediary placeholder structures.
        </p>
      </div>

      {errorMsg ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="border border-zinc-950 bg-white p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
              >
                <option value="Movie">Movie</option>
                <option value="Concert">Concert</option>
                <option value="Theater">Theater</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Event Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Ticket Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Total Capacity</label>
              <input
                type="number"
                min="1"
                step="1"
                name="totalCapacity"
                value={formData.totalCapacity}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Banner Asset</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event, 'bannerUrl')}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:border file:border-zinc-950 file:bg-zinc-950 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.28em] file:text-white hover:file:bg-white hover:file:text-zinc-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Logo Stamp</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event, 'logoUrl')}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:border file:border-zinc-950 file:bg-zinc-950 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.28em] file:text-white hover:file:bg-white hover:file:text-zinc-950"
              />
            </div>

            <div className="md:col-span-2 border-t border-zinc-950 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full border border-zinc-950 bg-zinc-950 px-4 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-white transition-all duration-200 hover:scale-[1.01] hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                {submitting ? 'Publishing...' : 'Publish Live Event'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="border border-zinc-950 bg-zinc-950 p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Live Preview</p>
            <p className="mt-3 text-lg font-black uppercase tracking-[0.16em]">{formData.title || 'Untitled Manifest'}</p>
            <p className="mt-2 text-sm text-zinc-300">{previewDate || 'Schedule pending'}</p>
            <p className="mt-2 text-sm text-zinc-300">{previewPrice}</p>
          </div>

          <div className="overflow-hidden border border-zinc-950 bg-white">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-zinc-100 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Banner preview
              </div>
            )}
          </div>

          <div className="border border-zinc-950 bg-white p-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center border border-dashed border-zinc-300 text-[9px] font-black uppercase tracking-[0.28em] text-zinc-400">
                Logo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
