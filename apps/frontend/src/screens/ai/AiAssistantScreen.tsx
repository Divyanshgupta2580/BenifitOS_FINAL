import React, { useState, useRef } from 'react';
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
import { useAiChat, ChatMessage } from '../../hooks/useAiChat';

interface Props {
  onBack?: () => void;
}

export const AiAssistantScreen: React.FC<Props> = ({ onBack }) => {
  const { messages, isLoading, sendMessage, retryLastMessage, clearChat, suggestedPrompts } = useAiChat();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
            item.isError && styles.bubbleError,
          ]}
        >
          {!isUser && (
            <View style={styles.assistantHeader}>
              <Text style={styles.assistantBadge}>🤖 {item.provider || 'BenefitOS AI'}</Text>
            </View>
          )}

          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
            {item.text}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAssistant]}>
              {item.timestamp}
            </Text>
          </View>

          {item.isError && (
            <TouchableOpacity onPress={retryLastMessage} style={styles.retryBtn} accessibilityLabel="Retry sending prompt">
              <Text style={styles.retryText}>🔄 Retry Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back button">
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Citizen AI Assistant</Text>
          <Text style={styles.subtitle}>Powered by BenefitOS Gemini Vision Intelligence</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} accessibilityLabel="Clear chat history">
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Suggested Prompts Bar */}
      <View style={styles.promptsContainer}>
        <Text style={styles.promptsTitle}>Suggested Guidance Prompts:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsRow}>
          {suggestedPrompts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handlePromptSelect(p)}
              disabled={isLoading}
              accessibilityLabel={`Suggested prompt: ${p}`}
            >
              <Text style={styles.promptText}>💡 {p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message History List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator Loading Container */}
      {isLoading && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.typingText}>BenefitOS AI is analyzing citizen context and generating response...</Text>
        </View>
      )}

      {/* Input Action Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask AI about schemes, documents, or eligibility..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          accessibilityLabel="Send message to AI assistant"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { paddingRight: theme.spacing.sm },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  titleContainer: { flex: 1, paddingHorizontal: theme.spacing.xs },
  title: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  subtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  clearBtn: { padding: theme.spacing.xs },
  clearText: { fontSize: theme.typography.sizes.xs, color: theme.colors.danger, fontWeight: theme.typography.weights.medium },
  
  promptsContainer: { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.xs, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  promptsTitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.bold, paddingHorizontal: theme.spacing.lg, marginBottom: 4 },
  promptsRow: { paddingHorizontal: theme.spacing.lg },
  promptChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  promptText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textPrimary },

  messageList: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  messageRow: { marginBottom: theme.spacing.md, flexDirection: 'row' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAssistant: { justifyContent: 'flex-start' },
  
  bubble: { maxWidth: '85%', padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md },
  bubbleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 2 },
  bubbleAssistant: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 2 },
  bubbleError: { borderColor: theme.colors.danger, backgroundColor: '#FEF2F2' },
  
  assistantHeader: { marginBottom: 4 },
  assistantBadge: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  messageText: { fontSize: theme.typography.sizes.sm, lineHeight: 20 },
  messageTextUser: { color: '#FFFFFF' },
  messageTextAssistant: { color: theme.colors.textPrimary },
  
  metaRow: { marginTop: 6, alignItems: 'flex-end' },
  timestamp: { fontSize: 10 },
  timestampUser: { color: '#E2E8F0' },
  timestampAssistant: { color: theme.colors.textSecondary },
  
  retryBtn: { marginTop: 8, backgroundColor: '#FEE2E2', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start' },
  retryText: { fontSize: theme.typography.sizes.xs, color: theme.colors.danger, fontWeight: theme.typography.weights.bold },
  
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xs, backgroundColor: theme.colors.surface },
  typingText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginLeft: theme.spacing.xs },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md, paddingVertical: 8, fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, maxHeight: 100 },
  sendBtn: { marginLeft: theme.spacing.sm, backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.spacing.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: theme.colors.border },
  sendBtnText: { color: '#FFFFFF', fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.sm },
});
