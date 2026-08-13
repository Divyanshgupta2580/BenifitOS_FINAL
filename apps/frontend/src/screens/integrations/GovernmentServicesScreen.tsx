import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  IdCardIcon,
  FolderIcon,
  HeartPulseIcon,
  SproutIcon,
  BriefcaseIcon,
  GlobeIcon,
  CreditCardIcon,
  CarIcon,
  DocumentTextIcon,
  BuildingIcon,
  HomeIcon,
  UserIcon,
} from '../../components/ui/Icons';
import { useGovernmentServices } from '../../hooks/useGovernmentServices';
import { GovernmentServiceItem, ServiceStatus } from '../../services/government.service';

const renderServiceIcon = (iconType: string) => {
  switch (iconType) {
    case 'id-card':
    case 'voter':
    case 'passport':
      return <IdCardIcon className="w-6 h-6 text-blue-900" />;
    case 'folder':
      return <FolderIcon className="w-6 h-6 text-blue-900" />;
    case 'health':
      return <HeartPulseIcon className="w-6 h-6 text-rose-700" />;
    case 'agriculture':
      return <SproutIcon className="w-6 h-6 text-emerald-700" />;
    case 'labour':
      return <BriefcaseIcon className="w-6 h-6 text-amber-700" />;
    case 'mobile':
      return <GlobeIcon className="w-6 h-6 text-blue-900" />;
    case 'card':
      return <CreditCardIcon className="w-6 h-6 text-indigo-700" />;
    case 'vehicle':
      return <CarIcon className="w-6 h-6 text-cyan-700" />;
    case 'document':
    case 'registry':
      return <DocumentTextIcon className="w-6 h-6 text-slate-700" />;
    case 'building':
      return <BuildingIcon className="w-6 h-6 text-blue-900" />;
    case 'home':
      return <HomeIcon className="w-6 h-6 text-blue-900" />;
    case 'child':
      return <UserIcon className="w-6 h-6 text-purple-700" />;
    default:
      return <BuildingIcon className="w-6 h-6 text-blue-900" />;
  }
};

interface Props {
  onBack: () => void;
}

const CATEGORIES = ['ALL', 'IDENTITY', 'DOCUMENTS', 'HEALTH', 'AGRICULTURE', 'LABOUR', 'CIVIL'];

export const GovernmentServicesScreen: React.FC<Props> = ({ onBack }) => {
  const {
    services,
    isLoading,
    isError,
    refetch,
    connectService,
    isConnecting,
    syncService,
    isSyncing,
    disconnectService,
    isDisconnecting,
  } = useGovernmentServices();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Connection Modal State
  const [activeModalService, setActiveModalService] = useState<GovernmentServiceItem | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('999999999999');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  const connectedCount = services.filter((s) => s.status === 'CONNECTED' || s.status === 'VERIFIED').length;
  const verifiedCount = services.filter((s) => s.status === 'VERIFIED').length;
  const pendingCount = services.filter((s) => s.status === 'PENDING').length;

  const handleOpenConnect = (service: GovernmentServiceItem) => {
    if (service.code === 'DIGILOCKER') {
      alert('Redirecting to official DigiLocker OAuth2 authentication gateway...');
      return;
    }
    setActiveModalService(service);
    setIsOtpSent(false);
    setOtp('');
    setTxnId('');
    setStatusMessage(null);
  };

  const handleRequestOtp = async () => {
    setStatusMessage(null);
    if (aadhaarNumber.length !== 12) {
      setStatusMessage({ type: 'error', text: 'Aadhaar number must be exactly 12 digits.' });
      return;
    }
    try {
      const res: any = await connectService({ aadhaarNumber });
      setTxnId(res.txnId || 'TXN-GOV-' + Date.now());
      setIsOtpSent(true);
      setStatusMessage({ type: 'success', text: 'Verification OTP dispatched to registered mobile number.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not request verification OTP.' });
    }
  };

  const handleVerifyOtp = async () => {
    setStatusMessage(null);
    if (otp.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Verification OTP must be 6 digits.' });
      return;
    }
    try {
      await connectService({ otp, txnId: txnId || 'TXN-GOV-LIVE' });
      setStatusMessage({ type: 'success', text: `${activeModalService?.name} verified and connected.` });
      setTimeout(() => {
        setActiveModalService(null);
        refetch();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Invalid verification OTP.' });
    }
  };

  const handleSync = async (service: GovernmentServiceItem) => {
    try {
      await syncService(service.id);
      alert(`${service.name} data updated from national registry.`);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Could not sync service data.');
    }
  };

  const handleDisconnect = async (service: GovernmentServiceItem) => {
    if (window.confirm(`Are you sure you want to disconnect ${service.name}? You will need to re-verify your identity.`)) {
      await disconnectService(service.id);
      alert(`${service.name} integration unlinked.`);
      refetch();
    }
  };

  const getBadgeVariant = (status: ServiceStatus): 'success' | 'warning' | 'danger' | 'primary' => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'CONNECTED':
      case 'MOCKED':
        return 'primary';
      case 'PENDING':
      case 'NOT_CONFIGURED':
        return 'warning';
      case 'EXPIRED':
      case 'NOT_CONNECTED':
      default:
        return 'danger';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
              ← Back
            </button>
            <h1 className="text-lg font-bold text-blue-900">Government Services Integration Hub</h1>
          </div>
          <span className="text-xs font-medium text-slate-500">{connectedCount} Active Integrations</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Summary Widgets Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center py-4">
            <span className="text-2xl font-black text-blue-900">{connectedCount}</span>
            <span className="text-xs text-slate-500 block font-medium mt-0.5">Connected</span>
          </Card>
          <Card className="text-center py-4">
            <span className="text-2xl font-black text-emerald-700">{verifiedCount}</span>
            <span className="text-xs text-slate-500 block font-medium mt-0.5">Verified</span>
          </Card>
          <Card className="text-center py-4">
            <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
            <span className="text-xs text-slate-500 block font-medium mt-0.5">Pending</span>
          </Card>
        </div>

        {/* Category Chips Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={160} className="rounded-xl" />
            <Skeleton height={160} className="rounded-xl" />
          </div>
        ) : isError ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-rose-600 font-semibold mb-4">Unable to load government integration services.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((item: GovernmentServiceItem) => (
              <Card key={item.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {renderServiceIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category} REGISTRY</span>
                      </div>
                    </div>
                    <Badge label={item.status} variant={getBadgeVariant(item.status)} />
                  </div>

                  <p className="text-xs text-slate-600 mb-4">{item.description}</p>
                </div>

                <div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 mb-4">
                    <span>
                      Gateway Status:{' '}
                      <strong className={item.health === 'HEALTHY' ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.health}
                      </strong>
                    </span>
                    <span>Last Synced: {item.lastSynced || 'Never'}</span>
                  </div>

                  <div className="flex gap-2">
                    {item.status === 'NOT_CONNECTED' || item.status === 'EXPIRED' ? (
                      <Button
                        title="Connect Account"
                        onClick={() => handleOpenConnect(item)}
                        isLoading={isConnecting}
                        className="w-full py-2.5 font-bold"
                      />
                    ) : (
                      <>
                        <Button
                          title="Sync Registry"
                          onClick={() => handleSync(item)}
                          isLoading={isSyncing}
                          variant="outline"
                          className="flex-1 py-2 font-semibold"
                        />
                        <Button
                          title="Disconnect"
                          onClick={() => handleDisconnect(item)}
                          isLoading={isDisconnecting}
                          variant="outline"
                          className="px-4 py-2 text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                        />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for Aadhaar / Government Gateway OTP Link */}
        {activeModalService && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-blue-900">Connect {activeModalService.name}</h2>
              <p className="text-xs text-slate-600">Enter your official 12-digit number to request e-KYC authentication OTP.</p>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg border text-xs font-semibold ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              {!isOtpSent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRequestOtp();
                  }}
                  className="space-y-4"
                >
                  <Input
                    label="Aadhaar / Registry Identifier"
                    value={aadhaarNumber}
                    onChangeText={setAadhaarNumber}
                    maxLength={12}
                    required
                  />
                  <Button type="submit" title="Request Verification OTP" isLoading={isConnecting} className="w-full py-3 font-bold" />
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOtp();
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs font-bold font-mono text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
                    Transaction ID: {txnId}
                  </p>
                  <Input
                    label="6-Digit Verification OTP"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                    required
                  />
                  <Button type="submit" title="Verify & Link Account" isLoading={isConnecting} className="w-full py-3 font-bold" />
                </form>
              )}

              <Button
                type="button"
                title="Cancel"
                variant="outline"
                onClick={() => setActiveModalService(null)}
                className="w-full py-2"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
