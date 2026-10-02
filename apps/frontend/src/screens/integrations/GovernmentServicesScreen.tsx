import React, { useState } from 'react';
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
  CheckCircle2Icon,
  AlertTriangleIcon,
  RefreshIcon,
  ArrowRightIcon,
  XIcon,
} from '../../components/ui/Icons';
import { useGovernmentServices } from '../../hooks/useGovernmentServices';
import { GovernmentServiceItem } from '../../services/government.service';
import { AppLayout } from '../../components/layout/AppLayout';

const renderServiceIcon = (iconType: string) => {
  switch (iconType) {
    case 'id-card':
    case 'voter':
    case 'passport':
      return <IdCardIcon className="w-5 h-5 text-mint-400" />;
    case 'folder':
      return <FolderIcon className="w-5 h-5 text-sky-400" />;
    case 'health':
      return <HeartPulseIcon className="w-5 h-5 text-rose-400" />;
    case 'agriculture':
      return <SproutIcon className="w-5 h-5 text-emerald-400" />;
    case 'labour':
      return <BriefcaseIcon className="w-5 h-5 text-amber-400" />;
    case 'mobile':
      return <GlobeIcon className="w-5 h-5 text-mint-400" />;
    case 'card':
      return <CreditCardIcon className="w-5 h-5 text-purple-400" />;
    case 'vehicle':
      return <CarIcon className="w-5 h-5 text-cyan-400" />;
    default:
      return <BuildingIcon className="w-5 h-5 text-mint-400" />;
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

  return (
    <AppLayout activeTab="government-services">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs font-semibold text-mint-400 hover:underline mr-2"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Government Services Gateway
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct digital integration with central and state citizen registries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/30 text-mint-300">
              {connectedCount} Connected Services
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connected Registries</p>
              <h3 className="text-xl font-black text-white font-heading mt-0.5">{connectedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-mint-400">
              <CheckCircle2Icon className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Records</p>
              <h3 className="text-xl font-black text-white font-heading mt-0.5">{verifiedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BuildingIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Pending</p>
              <h3 className="text-xl font-black text-white font-heading mt-0.5">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-4 shadow-lg flex gap-2 overflow-x-auto custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white hover:border-forest-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton height={180} className="rounded-2xl" />
            <Skeleton height={180} className="rounded-2xl" />
            <Skeleton height={180} className="rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-[#160D10] border border-rose-900/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-300">Unable to load government integration services.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredServices.map((service) => {
              const isConnected = service.status === 'CONNECTED' || service.status === 'VERIFIED';

              return (
                <div
                  key={service.id}
                  className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-forest-950 border border-[#1C3127] flex items-center justify-center shadow-xs">
                        {renderServiceIcon(service.icon || 'building')}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isConnected
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-mint-300'
                            : 'bg-forest-950 border-[#1C3127] text-slate-400'
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white font-heading leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1C3127]/60 flex items-center justify-between gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => syncService(service.id)}
                          disabled={isSyncing}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-400 hover:text-mint-300"
                        >
                          <RefreshIcon className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>Sync Data</span>
                        </button>
                        <button
                          onClick={() => disconnectService(service.id)}
                          disabled={isDisconnecting}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenConnect(service)}
                        disabled={isConnecting}
                        className="w-full py-2 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 text-xs font-bold shadow-md transition-all text-center"
                      >
                        Connect Registry
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Connect Service */}
        {activeModalService && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0E1712] border border-[#1C3127] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#1C3127]/60 pb-3">
                <h3 className="text-base font-bold text-white font-heading">
                  Connect {activeModalService.name}
                </h3>
                <button
                  onClick={() => setActiveModalService(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {!isOtpSent ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Enter your 12-digit Aadhaar number to authenticate with the {activeModalService.name} citizen registry.
                  </p>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="12-digit Aadhaar number"
                    className="w-full p-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-sm font-mono text-white text-center tracking-widest focus:outline-none focus:border-mint-500"
                  />
                  <button
                    onClick={handleRequestOtp}
                    disabled={isConnecting}
                    className="w-full py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs shadow-md transition-colors"
                  >
                    Request OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Enter the 6-digit OTP received on your Aadhaar-linked mobile:
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full p-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-lg font-mono text-white text-center tracking-widest focus:outline-none focus:border-mint-500"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isConnecting}
                    className="w-full py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs shadow-md transition-colors"
                  >
                    Verify &amp; Link
                  </button>
                </div>
              )}

              {statusMessage && (
                <p
                  className={`text-xs font-semibold text-center ${
                    statusMessage.type === 'success' ? 'text-mint-400' : 'text-rose-400'
                  }`}
                >
                  {statusMessage.text}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
