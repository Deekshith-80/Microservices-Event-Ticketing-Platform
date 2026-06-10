import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchTenantSettings, profileIsComplete, saveTenantSettings } from '../services/showtimeApi';

const EMPTY_PROFILE = {
  companyName: '',
  contactPhone: '',
  payoutRoutingNumber: '',
  payoutAccountNumber: '',
  brandName: 'SHOWTIME',
  tagline: 'Premium Ticket Exchange Network',
  supportEmail: 'operations@showtime.com'
};

export default function OrgProfile() {
  const { tenantId, refreshTenantSettings } = useAuth();
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedProfileComplete, setSavedProfileComplete] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetchTenantSettings(tenantId);
      if (response?.success) {
        const settings = response.settings || {};
        setFormData({
          companyName: settings.companyName || '',
          contactPhone: settings.contactPhone || '',
          payoutRoutingNumber: settings.payoutRoutingNumber || '',
          payoutAccountNumber: settings.payoutAccountNumber || '',
          brandName: settings.brandName || 'SHOWTIME',
          tagline: settings.tagline || 'Premium Ticket Exchange Network',
          supportEmail: settings.supportEmail || 'operations@showtime.com'
        });
        setSavedProfileComplete(Boolean(settings.isProfileComplete));
      }
    } catch (error) {
      setStatusMsg(error.response?.data?.error || 'Unable to load profile state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [tenantId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMsg('');

    try {
      const response = await saveTenantSettings(formData, tenantId);
      if (response?.success) {
        const settings = response.settings || {};
        setFormData({
          companyName: settings.companyName || '',
          contactPhone: settings.contactPhone || '',
          payoutRoutingNumber: settings.payoutRoutingNumber || '',
          payoutAccountNumber: settings.payoutAccountNumber || '',
          brandName: settings.brandName || 'SHOWTIME',
          tagline: settings.tagline || 'Premium Ticket Exchange Network',
          supportEmail: settings.supportEmail || 'operations@showtime.com'
        });
        setSavedProfileComplete(Boolean(settings.isProfileComplete));
        setStatusMsg(settings.isProfileComplete ? 'Profile verified and event publishing unlocked.' : 'Profile saved, but verification is still incomplete.');
        await refreshTenantSettings();
      }
    } catch (error) {
      setStatusMsg(error.response?.data?.error || 'Failed to verify profile ledger details.');
    }
  };

  const completenessLabel = profileIsComplete(formData) || savedProfileComplete ? 'Complete' : 'Incomplete';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 border-b border-zinc-950 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Corporate Profile</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-zinc-950">Verification Ledger</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Complete the legal and payout profile to unlock event creation and keep all organizer operations isolated within the tenant boundary.
        </p>
      </div>

      {statusMsg ? (
        <div className="mb-4 border border-zinc-950 bg-zinc-950 px-4 py-3 text-[11px] font-medium tracking-wide text-white">
          {statusMsg}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="border border-zinc-950 bg-white p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Routing Number</label>
              <input
                type="text"
                name="payoutRoutingNumber"
                value={formData.payoutRoutingNumber}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Account Number</label>
              <input
                type="text"
                name="payoutAccountNumber"
                value={formData.payoutAccountNumber}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Brand Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full border border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors duration-200 focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 border-t border-zinc-950 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="border border-zinc-950 bg-zinc-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all duration-200 hover:scale-[1.02] hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Profile completeness is currently {completenessLabel}
              </p>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="border border-zinc-950 bg-zinc-950 p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Verification Status</p>
            <p className="mt-3 text-xl font-black uppercase tracking-[0.16em]">
              {savedProfileComplete ? 'Unlocked' : 'Locked'}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              The event factory remains locked until all payment and legal identity fields are complete.
            </p>
          </div>

          <div className="border border-zinc-950 bg-white p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500">Profile Rules</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-700">
              <li>• Company name, contact phone, routing number, and account number are mandatory.</li>
              <li>• Saving recalculates the backend completeness flag in the tenant record.</li>
              <li>• Event creation remains disabled until the profile is marked complete.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
