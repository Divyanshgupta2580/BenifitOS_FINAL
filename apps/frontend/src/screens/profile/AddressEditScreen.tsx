import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const AddressEditScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const addr = profile?.address;

  const [streetAddress, setStreetAddress] = useState(addr?.streetAddress || '');
  const [city, setCity] = useState(addr?.city || '');
  const [district, setDistrict] = useState(addr?.district || '');
  const [state, setState] = useState(addr?.state || '');
  const [pincode, setPincode] = useState(addr?.pincode || '');
  const [isRural, setIsRural] = useState(addr?.isRural || false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!streetAddress || !city || !district || !state || !pincode) {
      setStatusMessage({ type: 'error', text: 'All address fields are required.' });
      return;
    }

    try {
      await updateProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        dateOfBirth: profile?.dateOfBirth || new Date().toISOString(),
        gender: profile?.gender || 'MALE',
        maritalStatus: profile?.maritalStatus || 'SINGLE',
        socialCategory: profile?.socialCategory || 'GENERAL',
        employmentStatus: profile?.employmentStatus || 'UNEMPLOYED',
        annualIncomeINR: profile?.annualIncomeINR || 0,
        disabilityType: profile?.disabilityType || 'NONE',
        disabilityPercent: profile?.disabilityPercent || 0,
        isBplCardHolder: profile?.isBplCardHolder || false,
        bplCardNumber: profile?.bplCardNumber,
        address: {
          streetAddress,
          city,
          district,
          state,
          pincode,
          isRural,
        },
      });

      setStatusMessage({ type: 'success', text: 'Residential address updated successfully!' });
      setTimeout(onBack, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not save residential address.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Profile
          </button>
          <h1 className="text-lg font-bold text-blue-900">Edit Residential Address</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {statusMessage && (
            <div
              className={`mb-6 p-3.5 rounded-xl border text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Street Address" value={streetAddress} onChangeText={setStreetAddress} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="City / Village" value={city} onChangeText={setCity} required />
              <Input label="District" value={district} onChangeText={setDistrict} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="State" value={state} onChangeText={setState} required />
              <Input label="Pincode" value={pincode} onChangeText={setPincode} maxLength={6} required />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label htmlFor="rural-toggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                  Rural Resident Category
                </label>
                <span className="text-[11px] text-slate-500">Enable if residing in gram panchayat / rural district area.</span>
              </div>
              <input
                id="rural-toggle"
                type="checkbox"
                checked={isRural}
                onChange={(e) => setIsRural(e.target.checked)}
                className="w-5 h-5 text-blue-900 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" title="Save Address" isLoading={isUpdating} className="flex-1 py-3" />
              <Button type="button" title="Cancel" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
