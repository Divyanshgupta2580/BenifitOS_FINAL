import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useLanguageStore } from '../store/language.store';
import { useThemeStore } from '../store/theme.store';
import { LanguageSelectScreen } from '../screens/auth/LanguageSelectScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PasswordResetScreen } from '../screens/auth/PasswordResetScreen';
import { MfaSetupScreen } from '../screens/auth/MfaSetupScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CitizenProfileScreen } from '../screens/profile/CitizenProfileScreen';
import { DemographicsEditScreen } from '../screens/profile/DemographicsEditScreen';
import { AddressEditScreen } from '../screens/profile/AddressEditScreen';
import { HouseholdMembersScreen } from '../screens/profile/HouseholdMembersScreen';
import { LandDetailsScreen } from '../screens/profile/LandDetailsScreen';
import { SchemeCatalogScreen } from '../screens/schemes/SchemeCatalogScreen';
import { SchemeDetailScreen } from '../screens/schemes/SchemeDetailScreen';
import { EligibilitySimulatorScreen } from '../screens/schemes/EligibilitySimulatorScreen';
import { RecommendationDashboardScreen } from '../screens/recommendations/RecommendationDashboardScreen';
import { RecommendationDetailScreen } from '../screens/recommendations/RecommendationDetailScreen';
import { RecommendationExplanationScreen } from '../screens/recommendations/RecommendationExplanationScreen';
import { RecommendationComparisonScreen } from '../screens/recommendations/RecommendationComparisonScreen';
import { DocumentVaultScreen } from '../screens/documents/DocumentVaultScreen';
import { DocumentUploadScreen } from '../screens/documents/DocumentUploadScreen';
import { DocumentViewerModal } from '../screens/documents/DocumentViewerModal';
import { OcrReviewScreen } from '../screens/documents/OcrReviewScreen';
import { ApplicationsListScreen } from '../screens/applications/ApplicationsListScreen';
import { ApplicationWizardScreen } from '../screens/applications/ApplicationWizardScreen';
import { ApplicationTimelineScreen } from '../screens/applications/ApplicationTimelineScreen';
import { ApplicationDetailScreen } from '../screens/applications/ApplicationDetailScreen';
import { AiAssistantScreen } from '../screens/ai/AiAssistantScreen';
import { AiCopilotScreen } from '../screens/ai/AiCopilotScreen';
import { GovernmentServicesScreen } from '../screens/integrations/GovernmentServicesScreen';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return <LoadingSpinner message="Verifying session..." />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return <LoadingSpinner message="Initializing BenefitOS..." />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route wrapper helpers to adapt screen callback props with router navigation
const SchemeDetailWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <SchemeDetailScreen
      schemeId={id || ''}
      onBack={() => navigate('/schemes')}
      onSimulateEligibility={(schemeId) => navigate(`/schemes/${schemeId}/simulate`)}
    />
  );
};

const EligibilitySimulatorWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <EligibilitySimulatorScreen
      schemeId={id || ''}
      onBack={() => navigate(`/schemes/${id}`)}
    />
  );
};

const RecommendationDetailWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <RecommendationDetailScreen
      recommendationId={id || ''}
      onBack={() => navigate('/recommendations')}
      onViewExplanation={(recId) => navigate(`/recommendations/${recId}/explain`)}
    />
  );
};

const RecommendationExplanationWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <RecommendationExplanationScreen
      recommendationId={id || ''}
      onBack={() => navigate(`/recommendations/${id}`)}
    />
  );
};

const RecommendationComparisonWrapper = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];
  return (
    <RecommendationComparisonScreen
      recommendationIds={ids}
      onBack={() => navigate('/recommendations')}
    />
  );
};

const DocumentViewerWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <DocumentViewerModal
      documentId={id || ''}
      onBack={() => navigate('/documents')}
      onRunOcr={(docId) => navigate(`/documents/${docId}/ocr`)}
    />
  );
};

const OcrReviewWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <OcrReviewScreen
      documentId={id || ''}
      onBack={() => navigate(`/documents/${id}`)}
    />
  );
};

const ApplicationTimelineWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <ApplicationTimelineScreen
      applicationId={id || ''}
      onBack={() => navigate('/applications')}
      onViewDetails={(appId) => navigate(`/applications/${appId}`)}
    />
  );
};

const ApplicationDetailWrapper = () => {
  const navigate = useNavigate();
  const { id } = (useParams() as any);
  return (
    <ApplicationDetailScreen
      applicationId={id || ''}
      onBack={() => navigate('/applications')}
    />
  );
};

export const AppNavigator: React.FC = () => {
  const { isLoading, loadAuthFromStorage } = useAuthStore();
  const { loadLocale } = useLanguageStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    loadLocale();
    loadAuthFromStorage();
  }, [initTheme, loadLocale, loadAuthFromStorage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <LoadingSpinner message="Initializing BenefitOS Web Platform..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Guest Routes */}
        <Route path="/language" element={<LanguageSelectScreenWrapper />} />
        <Route path="/onboarding" element={<OnboardingScreenWrapper />} />
        <Route path="/login" element={<GuestRoute><LoginScreenWrapper /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterScreenWrapper /></GuestRoute>} />
        <Route path="/reset-password" element={<PasswordResetScreenWrapper />} />
        <Route path="/mfa-setup" element={<MfaSetupScreenWrapper />} />

        {/* Protected App Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreenWrapper /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><CitizenProfileScreenWrapper /></ProtectedRoute>} />
        <Route path="/profile/demographics" element={<ProtectedRoute><DemographicsEditScreenWrapper /></ProtectedRoute>} />
        <Route path="/profile/address" element={<ProtectedRoute><AddressEditScreenWrapper /></ProtectedRoute>} />
        <Route path="/profile/household" element={<ProtectedRoute><HouseholdMembersScreenWrapper /></ProtectedRoute>} />
        <Route path="/profile/land" element={<ProtectedRoute><LandDetailsScreenWrapper /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><SchemeCatalogScreenWrapper /></ProtectedRoute>} />
        <Route path="/schemes/:id" element={<ProtectedRoute><SchemeDetailWrapper /></ProtectedRoute>} />
        <Route path="/schemes/:id/simulate" element={<ProtectedRoute><EligibilitySimulatorWrapper /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationDashboardScreenWrapper /></ProtectedRoute>} />
        <Route path="/recommendations/compare" element={<ProtectedRoute><RecommendationComparisonWrapper /></ProtectedRoute>} />
        <Route path="/recommendations/:id" element={<ProtectedRoute><RecommendationDetailWrapper /></ProtectedRoute>} />
        <Route path="/recommendations/:id/explain" element={<ProtectedRoute><RecommendationExplanationWrapper /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentVaultScreenWrapper /></ProtectedRoute>} />
        <Route path="/documents/upload" element={<ProtectedRoute><DocumentUploadScreenWrapper /></ProtectedRoute>} />
        <Route path="/documents/:id" element={<ProtectedRoute><DocumentViewerWrapper /></ProtectedRoute>} />
        <Route path="/documents/:id/ocr" element={<ProtectedRoute><OcrReviewWrapper /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsListScreenWrapper /></ProtectedRoute>} />
        <Route path="/applications/new" element={<ProtectedRoute><ApplicationWizardScreenWrapper /></ProtectedRoute>} />
        <Route path="/applications/:id/timeline" element={<ProtectedRoute><ApplicationTimelineWrapper /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailWrapper /></ProtectedRoute>} />
        <Route path="/ai/chat" element={<ProtectedRoute><AiAssistantScreenWrapper /></ProtectedRoute>} />
        <Route path="/ai/copilot" element={<ProtectedRoute><AiCopilotScreenWrapper /></ProtectedRoute>} />
        <Route path="/government-services" element={<ProtectedRoute><GovernmentServicesScreenWrapper /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Route wrapper helpers for screens with simple navigate callbacks
const LanguageSelectScreenWrapper = () => {
  const navigate = useNavigate();
  return <LanguageSelectScreen onContinue={() => navigate('/onboarding')} />;
};

const OnboardingScreenWrapper = () => {
  const navigate = useNavigate();
  return <OnboardingScreen onFinish={() => navigate('/login')} />;
};

const LoginScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <LoginScreen
      onNavigateToRegister={() => navigate('/register')}
      onNavigateToForgotPassword={() => navigate('/reset-password')}
    />
  );
};

const RegisterScreenWrapper = () => {
  const navigate = useNavigate();
  return <RegisterScreen onNavigateToLogin={() => navigate('/login')} />;
};

const PasswordResetScreenWrapper = () => {
  const navigate = useNavigate();
  return <PasswordResetScreen onBackToLogin={() => navigate('/login')} />;
};

const MfaSetupScreenWrapper = () => {
  const navigate = useNavigate();
  return <MfaSetupScreen onComplete={() => navigate('/login')} />;
};

const DashboardScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <DashboardScreen
      onNavigateToProfile={() => navigate('/profile')}
      onNavigateToSchemes={() => navigate('/schemes')}
      onNavigateToRecommendations={() => navigate('/recommendations')}
      onNavigateToVault={() => navigate('/documents')}
      onNavigateToApplications={() => navigate('/applications')}
      onNavigateToAi={() => navigate('/ai/copilot')}
      onNavigateToGovernmentServices={() => navigate('/government-services')}
      onNavigateToAiCopilot={() => navigate('/ai/copilot')}
    />
  );
};

const CitizenProfileScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <CitizenProfileScreen
      onNavigateToDemographics={() => navigate('/profile/demographics')}
      onNavigateToAddress={() => navigate('/profile/address')}
      onNavigateToHousehold={() => navigate('/profile/household')}
      onNavigateToLand={() => navigate('/profile/land')}
      onBack={() => navigate('/dashboard')}
    />
  );
};

const DemographicsEditScreenWrapper = () => {
  const navigate = useNavigate();
  return <DemographicsEditScreen onBack={() => navigate('/profile')} />;
};

const AddressEditScreenWrapper = () => {
  const navigate = useNavigate();
  return <AddressEditScreen onBack={() => navigate('/profile')} />;
};

const HouseholdMembersScreenWrapper = () => {
  const navigate = useNavigate();
  return <HouseholdMembersScreen onBack={() => navigate('/profile')} />;
};

const LandDetailsScreenWrapper = () => {
  const navigate = useNavigate();
  return <LandDetailsScreen onBack={() => navigate('/profile')} />;
};

const SchemeCatalogScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <SchemeCatalogScreen
      onSelectScheme={(id) => navigate(`/schemes/${id}`)}
      onBack={() => navigate('/dashboard')}
    />
  );
};

const RecommendationDashboardScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <RecommendationDashboardScreen
      onSelectRecommendation={(id) => navigate(`/recommendations/${id}`)}
      onCompareRecommendations={(ids) => navigate(`/recommendations/compare?ids=${ids.join(',')}`)}
      onBack={() => navigate('/dashboard')}
    />
  );
};

const DocumentVaultScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <DocumentVaultScreen
      onNavigateToUpload={() => navigate('/documents/upload')}
      onPreviewDocument={(id) => navigate(`/documents/${id}`)}
      onBack={() => navigate('/dashboard')}
    />
  );
};

const DocumentUploadScreenWrapper = () => {
  const navigate = useNavigate();
  return <DocumentUploadScreen onBack={() => navigate('/documents')} />;
};

const ApplicationsListScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <ApplicationsListScreen
      onStartNewApplication={() => navigate('/applications/new')}
      onSelectApplication={(id) => navigate(`/applications/new`)}
      onSelectApplicationTimeline={(id) => navigate(`/applications/${id}/timeline`)}
      onBack={() => navigate('/dashboard')}
    />
  );
};

const ApplicationWizardScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <ApplicationWizardScreen
      onBack={() => navigate('/applications')}
      onSuccess={() => navigate('/applications')}
    />
  );
};

const AiAssistantScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <AiAssistantScreen
      onBack={() => navigate('/dashboard')}
      onNavigateToSchemes={() => navigate('/schemes')}
      onNavigateToVault={() => navigate('/documents')}
      onNavigateToApplications={() => navigate('/applications')}
    />
  );
};

const AiCopilotScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <AiCopilotScreen
      onBack={() => navigate('/dashboard')}
      onNavigateToSchemes={() => navigate('/schemes')}
      onNavigateToVault={() => navigate('/documents')}
      onNavigateToApplications={() => navigate('/applications')}
      onNavigateToGovernmentServices={() => navigate('/government-services')}
    />
  );
};

const GovernmentServicesScreenWrapper = () => {
  const navigate = useNavigate();
  return <GovernmentServicesScreen onBack={() => navigate('/dashboard')} />;
};
