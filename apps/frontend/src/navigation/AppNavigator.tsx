import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { useLanguageStore } from '../store/language.store';
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
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

type AuthStep = 'LANGUAGE' | 'ONBOARDING' | 'LOGIN' | 'REGISTER' | 'RESET' | 'MFA';
type AppStep =
  | 'DASHBOARD'
  | 'PROFILE_OVERVIEW'
  | 'PROFILE_DEMOGRAPHICS'
  | 'PROFILE_ADDRESS'
  | 'PROFILE_HOUSEHOLD'
  | 'PROFILE_LAND'
  | 'SCHEMES_CATALOG'
  | 'SCHEME_DETAIL'
  | 'ELIGIBILITY_SIMULATOR'
  | 'RECOMMENDATIONS_DASHBOARD'
  | 'RECOMMENDATION_DETAIL'
  | 'RECOMMENDATION_EXPLANATION'
  | 'RECOMMENDATION_COMPARISON'
  | 'DOCUMENT_VAULT'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VIEWER'
  | 'OCR_REVIEW'
  | 'APPLICATIONS_LIST'
  | 'APPLICATION_WIZARD'
  | 'APPLICATION_TIMELINE'
  | 'APPLICATION_DETAIL';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, loadAuthFromStorage } = useAuthStore();
  const { loadLocale } = useLanguageStore();
  const [authStep, setAuthStep] = useState<AuthStep>('LANGUAGE');
  const [appStep, setAppStep] = useState<AppStep>('DASHBOARD');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    loadLocale();
    loadAuthFromStorage();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Initializing BenefitOS Secure Environment..." />
      </View>
    );
  }

  if (isAuthenticated) {
    switch (appStep) {
      case 'PROFILE_OVERVIEW':
        return (
          <CitizenProfileScreen
            onNavigateToDemographics={() => setAppStep('PROFILE_DEMOGRAPHICS')}
            onNavigateToAddress={() => setAppStep('PROFILE_ADDRESS')}
            onNavigateToHousehold={() => setAppStep('PROFILE_HOUSEHOLD')}
            onNavigateToLand={() => setAppStep('PROFILE_LAND')}
            onBack={() => setAppStep('DASHBOARD')}
          />
        );
      case 'PROFILE_DEMOGRAPHICS':
        return <DemographicsEditScreen onBack={() => setAppStep('PROFILE_OVERVIEW')} />;
      case 'PROFILE_ADDRESS':
        return <AddressEditScreen onBack={() => setAppStep('PROFILE_OVERVIEW')} />;
      case 'PROFILE_HOUSEHOLD':
        return <HouseholdMembersScreen onBack={() => setAppStep('PROFILE_OVERVIEW')} />;
      case 'PROFILE_LAND':
        return <LandDetailsScreen onBack={() => setAppStep('PROFILE_OVERVIEW')} />;
      case 'SCHEMES_CATALOG':
        return (
          <SchemeCatalogScreen
            onSelectScheme={(id) => {
              setSelectedSchemeId(id);
              setAppStep('SCHEME_DETAIL');
            }}
            onBack={() => setAppStep('DASHBOARD')}
          />
        );
      case 'SCHEME_DETAIL':
        return (
          <SchemeDetailScreen
            schemeId={selectedSchemeId || ''}
            onBack={() => setAppStep('SCHEMES_CATALOG')}
            onSimulateEligibility={(id) => {
              setSelectedSchemeId(id);
              setAppStep('ELIGIBILITY_SIMULATOR');
            }}
          />
        );
      case 'ELIGIBILITY_SIMULATOR':
        return (
          <EligibilitySimulatorScreen
            schemeId={selectedSchemeId || ''}
            onBack={() => setAppStep('SCHEME_DETAIL')}
          />
        );
      case 'RECOMMENDATIONS_DASHBOARD':
        return (
          <RecommendationDashboardScreen
            onSelectRecommendation={(id) => {
              setSelectedRecId(id);
              setAppStep('RECOMMENDATION_DETAIL');
            }}
            onCompareRecommendations={(ids) => {
              setSelectedCompareIds(ids);
              setAppStep('RECOMMENDATION_COMPARISON');
            }}
            onBack={() => setAppStep('DASHBOARD')}
          />
        );
      case 'RECOMMENDATION_DETAIL':
        return (
          <RecommendationDetailScreen
            recommendationId={selectedRecId || ''}
            onBack={() => setAppStep('RECOMMENDATIONS_DASHBOARD')}
            onViewExplanation={(id) => {
              setSelectedRecId(id);
              setAppStep('RECOMMENDATION_EXPLANATION');
            }}
          />
        );
      case 'RECOMMENDATION_EXPLANATION':
        return (
          <RecommendationExplanationScreen
            recommendationId={selectedRecId || ''}
            onBack={() => setAppStep('RECOMMENDATION_DETAIL')}
          />
        );
      case 'RECOMMENDATION_COMPARISON':
        return (
          <RecommendationComparisonScreen
            recommendationIds={selectedCompareIds}
            onBack={() => setAppStep('RECOMMENDATIONS_DASHBOARD')}
          />
        );
      case 'DOCUMENT_VAULT':
        return (
          <DocumentVaultScreen
            onNavigateToUpload={() => setAppStep('DOCUMENT_UPLOAD')}
            onPreviewDocument={(id) => {
              setSelectedDocId(id);
              setAppStep('DOCUMENT_VIEWER');
            }}
            onBack={() => setAppStep('DASHBOARD')}
          />
        );
      case 'DOCUMENT_UPLOAD':
        return <DocumentUploadScreen onBack={() => setAppStep('DOCUMENT_VAULT')} />;
      case 'DOCUMENT_VIEWER':
        return (
          <DocumentViewerModal
            documentId={selectedDocId || ''}
            onBack={() => setAppStep('DOCUMENT_VAULT')}
            onRunOcr={(id) => {
              setSelectedDocId(id);
              setAppStep('OCR_REVIEW');
            }}
          />
        );
      case 'OCR_REVIEW':
        return (
          <OcrReviewScreen
            documentId={selectedDocId || ''}
            onBack={() => setAppStep('DOCUMENT_VIEWER')}
          />
        );
      case 'APPLICATIONS_LIST':
        return (
          <ApplicationsListScreen
            onStartNewApplication={() => setAppStep('APPLICATION_WIZARD')}
            onSelectApplication={(id) => {
              setSelectedAppId(id);
              setAppStep('APPLICATION_WIZARD');
            }}
            onSelectApplicationTimeline={(id) => {
              setSelectedAppId(id);
              setAppStep('APPLICATION_TIMELINE');
            }}
            onBack={() => setAppStep('DASHBOARD')}
          />
        );
      case 'APPLICATION_WIZARD':
        return (
          <ApplicationWizardScreen
            onBack={() => setAppStep('APPLICATIONS_LIST')}
            onSuccess={() => setAppStep('APPLICATIONS_LIST')}
          />
        );
      case 'APPLICATION_TIMELINE':
        return (
          <ApplicationTimelineScreen
            applicationId={selectedAppId || ''}
            onBack={() => setAppStep('APPLICATIONS_LIST')}
            onViewDetails={(id) => {
              setSelectedAppId(id);
              setAppStep('APPLICATION_DETAIL');
            }}
          />
        );
      case 'APPLICATION_DETAIL':
        return (
          <ApplicationDetailScreen
            applicationId={selectedAppId || ''}
            onBack={() => setAppStep('APPLICATION_TIMELINE')}
          />
        );
      case 'DASHBOARD':
      default:
        return (
          <DashboardScreen
            onNavigateToProfile={() => setAppStep('PROFILE_OVERVIEW')}
            onNavigateToSchemes={() => setAppStep('SCHEMES_CATALOG')}
            onNavigateToRecommendations={() => setAppStep('RECOMMENDATIONS_DASHBOARD')}
            onNavigateToVault={() => setAppStep('DOCUMENT_VAULT')}
            onNavigateToApplications={() => setAppStep('APPLICATIONS_LIST')}
          />
        );
    }
  }

  // Auth Flow Stack Navigation
  switch (authStep) {
    case 'LANGUAGE':
      return <LanguageSelectScreen onContinue={() => setAuthStep('ONBOARDING')} />;
    case 'ONBOARDING':
      return <OnboardingScreen onFinish={() => setAuthStep('LOGIN')} />;
    case 'REGISTER':
      return <RegisterScreen onNavigateToLogin={() => setAuthStep('LOGIN')} />;
    case 'RESET':
      return <PasswordResetScreen onBackToLogin={() => setAuthStep('LOGIN')} />;
    case 'MFA':
      return <MfaSetupScreen onComplete={() => setAuthStep('LOGIN')} />;
    case 'LOGIN':
    default:
      return (
        <LoginScreen
          onNavigateToRegister={() => setAuthStep('REGISTER')}
          onNavigateToForgotPassword={() => setAuthStep('RESET')}
        />
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
