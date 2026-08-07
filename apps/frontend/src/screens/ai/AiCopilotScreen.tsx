import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAiCopilot, CopilotMessage } from '../../hooks/useAiCopilot';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  onNavigateToGovernmentServices?: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Apply for Scheme', query: 'Guide me through applying for a welfare scheme.' },
  { label: 'Check Documents', query: 'What documents are missing from my vault?' },
  { label: 'Explain Recommendation', query: 'Explain why PM-KISAN is recommended for me.' },
  { label: 'Check Eligibility', query: 'Am I eligible for PM Awas Yojana housing scheme?' },
  { label: 'Government Services', query: 'How do I connect my DigiLocker and Aadhaar?' },
  { label: 'My Applications', query: 'What is the current timeline for my submitted application?' },
];

export const AiCopilotScreen: React.FC<Props> = ({
  onBack,
  onNavigateToSchemes,
  onNavigateToVault,
  onNavigateToApplications,
  onNavigateToGovernmentServices,
}) => {
  const {
    messages,
    sendMessage,
    isLoading,
    isError,
    clearMessages,
    language,
    toggleLanguage,
    isSpeechEnabled,
    toggleSpeech,
    exportHistory,
    retryLast,
  } = useAiCopilot();

  const { profile } = useCitizenProfile();
  const [inputQuery, setInputQuery] = useState('');

  const handleSend = () => {
    if (!inputQuery.trim()) return;
    const text = inputQuery;
    setInputQuery('');
    sendMessage(text, {
      citizenId: profile?.id,
      income: profile?.annualIncomeINR,
      state: profile?.address?.state,
    });
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[0]) => {
    if (action.label === 'Government Services' && onNavigateToGovernmentServices) {
      onNavigateToGovernmentServices();
      return;
    }
    if (action.label === 'Check Documents' && onNavigateToVault) {
      onNavigateToVault();
      return;
    }
    if (action.label === 'Apply for Scheme' && onNavigateToSchemes) {
      onNavigateToSchemes();
      return;
    }
    if (action.label === 'My Applications' && onNavigateToApplications) {
      onNavigateToApplications();
      return;
    }
    sendMessage(action.query);
  };

  const handleExport = () => {
    const jsonStr = exportHistory();
    Alert.alert('Export Conversation', 'Conversation history prepared for export.', [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  const renderMessageItem = ({ item }: { item: CopilotMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAssistant]}>
        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant]}>
          {!isUser && (
            <View style={styles.assistantMetaRow}>
              <Text style={styles.assistantBadge}>[Gemini 1.5 Pro AI]</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          )}

          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
            {item.text}
          </Text>

          {isUser && <Text style={styles.timestampUser}>{item.timestamp}</Text>}

          {/* Module 10: Source Attribution Badges */}
          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourceTitle}>Verified Sources:</Text>
              <View style={styles.sourcesRow}>
                {item.sources.map((src, idx) => (
                  <View key={idx} style={styles.sourcePill}>
                    <Text style={styles.sourcePillText}>✓ {src}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Module 1: Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backLink} accessibilityLabel="Back to Dashboard">
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.title}>AI Citizen Copilot</Text>
            <Text style={styles.subtitle}>
              {profile ? `Assisting ${profile.firstName} ${profile.lastName}` : 'Intelligent Welfare Assistant'}
            </Text>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.controlBtn} accessibilityLabel="Toggle Language">
              <Text style={styles.controlText}>{language === 'en' ? '🌐 HI' : '🌐 EN'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleSpeech}
              style={[styles.controlBtn, isSpeechEnabled && styles.controlBtnActive]}
              accessibilityLabel="Toggle Speech"
            >
              <Text style={styles.controlText}>{isSpeechEnabled ? '🔊 On' : '🎙️ Voice'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleExport} style={styles.controlBtn} accessibilityLabel="Export Chat">
              <Text style={styles.controlText}>📥</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearMessages} style={styles.controlBtn} accessibilityLabel="Clear Chat">
              <Text style={styles.controlText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Module 2: Context Awareness Banner */}
      <View style={styles.contextBanner}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextRow}>
          <View style={styles.contextPill}><Text style={styles.contextPillText}>👤 Verified Profile</Text></View>
          <View style={styles.contextPill}><Text style={styles.contextPillText}>🆔 Aadhaar Linked</Text></View>
          <View style={styles.contextPill}><Text style={styles.contextPillText}>📂 DigiLocker Synced</Text></View>
          <View style={styles.contextPill}><Text style={styles.contextPillText}>📜 4 Vault Documents</Text></View>
          <View style={styles.contextPill}><Text style={styles.contextPillText}>📋 2 Active Applications</Text></View>
        </ScrollView>
      </View>

      {/* Module 1: Quick Actions Chips Bar */}
      <View style={styles.quickActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_ACTIONS.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionChip}
              onPress={() => handleQuickAction(action)}
              accessibilityLabel={action.label}
            >
              <Text style={styles.actionChipText}>✨ {action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Module 9: Streaming / Typing Indicator */}
      {isLoading && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.typingText}>Copilot is analyzing profile & government databases...</Text>
        </View>
      )}

      {/* Error Fallback Bar */}
      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Connection timeout. Failed to fetch response.</Text>
          <Button title="Retry" onPress={retryLast} variant="outline" style={styles.retryBtn} />
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={language === 'hi' ? 'अपनी कल्याणकारी योजना के प्रश्न यहाँ पूछें...' : 'Ask your welfare journey questions...'}
          placeholderTextColor={theme.colors.textMuted}
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={handleSend}
          multiline
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isLoading || !inputQuery.trim()}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.lg, paddingTop: 50, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backLink: { marginBottom: theme.spacing.xs },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  subtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  
  controlsRow: { flexDirection: 'row', gap: 6 },
  controlBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderColor: theme.colors.border },
  controlBtnActive: { backgroundColor: theme.colors.primary },
  controlText: { fontSize: 11, color: theme.colors.primary, fontWeight: theme.typography.weights.bold },
  
  contextBanner: { backgroundColor: '#F8FAFC', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  contextRow: { paddingHorizontal: theme.spacing.md },
  contextPill: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 6 },
  contextPillText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  
  quickActionsContainer: { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.xs, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  quickRow: { paddingHorizontal: theme.spacing.md },
  actionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#EFF6FF', marginRight: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  actionChipText: { fontSize: theme.typography.sizes.xs, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  
  messagesContainer: { padding: theme.spacing.md, paddingBottom: 20 },
  msgWrapper: { marginBottom: theme.spacing.md, maxWidth: '85%' },
  msgWrapperUser: { alignSelf: 'flex-end' },
  msgWrapperAssistant: { alignSelf: 'flex-start' },
  
  msgBubble: { padding: theme.spacing.md, borderRadius: 16 },
  msgBubbleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 2 },
  msgBubbleAssistant: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 2 },
  
  assistantMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  assistantBadge: { fontSize: 10, color: theme.colors.primary, fontWeight: theme.typography.weights.bold },
  timestamp: { fontSize: 10, color: theme.colors.textMuted },
  timestampUser: { fontSize: 10, color: '#E2E8F0', alignSelf: 'flex-end', marginTop: 4 },
  
  msgText: { fontSize: theme.typography.sizes.sm, lineHeight: 20 },
  msgTextUser: { color: '#FFFFFF' },
  msgTextAssistant: { color: theme.colors.textPrimary },
  
  sourcesContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  sourceTitle: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.bold, marginBottom: 4 },
  sourcesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  sourcePill: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  sourcePillText: { fontSize: 9, color: theme.colors.success, fontWeight: theme.typography.weights.bold },
  
  typingContainer: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  typingText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginLeft: 8 },
  
  errorContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: '#FEF2F2' },
  errorText: { fontSize: theme.typography.sizes.xs, color: theme.colors.danger },
  retryBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  textInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, maxHeight: 100 },
  sendBtn: { marginLeft: 8, backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
