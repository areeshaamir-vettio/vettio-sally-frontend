'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Mic, Volume2, VolumeX } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { VoiceAgentWidget } from '@/components/voice-agent-widget';
import { ChatInterface } from '@/components/chat-interface';
import { ProfileDrawer } from '@/components/profile-drawer';
import { conversationalAiApi, ConversationalApiError } from '@/lib/conversational-ai-api';
import { RoleEnhancementResponse } from '@/types/role-enhancement';
import { roleUtils } from '@/hooks/useRole';

type ConversationMode = 'chat' | 'voice';

export default function ConversationalAIPage() {
  const router = useRouter();

  // Get role ID from session storage
  const [roleId, setRoleId] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<RoleEnhancementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('chat');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech function
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Load role ID from session storage on mount
  useEffect(() => {
    const storedRoleId = roleUtils.getCurrentRoleId();

    if (!storedRoleId) {
      console.warn('⚠️ No role ID found in session storage. Redirecting to job description page...');
      setError('No role found. Please start by creating a job description.');
      // Redirect to job description page after a short delay
      setTimeout(() => {
        router.push('/job-description');
      }, 2000);
      return;
    }

    console.log('✅ Loaded role ID from session storage:', storedRoleId);
    setRoleId(storedRoleId);
  }, [router]);

  // Initialize conversation when role ID is available
  useEffect(() => {
    if (!roleId) return;

    const initializeConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Start or get existing conversation
        const response = await conversationalAiApi.startConversation(roleId);
        setConversationData(response);
        setIsInitialized(true);

        // Speak the initial question
        if (response.next_question) {
          speakText(response.next_question);
        }
      } catch (err) {
        const errorMessage = err instanceof ConversationalApiError
          ? err.message
          : 'Failed to initialize conversation';

        console.error('Failed to initialize conversation:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();

    // Cleanup: stop speech when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [roleId]);

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isSendingMessage || !roleId) return;

    try {
      setIsSendingMessage(true);
      setError(null);

      // Optimistic update: Add user message immediately to the UI
      if (conversationData) {
        const optimisticUserMessage = {
          id: `temp-${Date.now()}`,
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString(),
        };

        setConversationData({
          ...conversationData,
          conversation: {
            ...conversationData.conversation,
            messages: [...conversationData.conversation.messages, optimisticUserMessage],
          },
        });
      }

      // Send message to API
      const response = await conversationalAiApi.sendMessage(roleId, message);

      // Update conversation data with actual API response
      // This will replace the optimistic update with real data
      setConversationData(response);

      // Speak the AI's response (next_question)
      if (response.next_question) {
        speakText(response.next_question);
      }
    } catch (err) {
      const errorMessage = err instanceof ConversationalApiError
        ? err.message
        : 'Failed to send message';

      console.error('Failed to send message:', err);
      setError(errorMessage);

      // Rollback optimistic update on error
      // The API response should contain the correct state, but if it fails
      // we should ideally remove the optimistic message
      throw err; // Re-throw to let ChatInterface handle it
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle voice input - same as text message
  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Use the same handler as text messages
    await handleSendMessage(transcript);
  };

  // Handle voice listening state change
  const handleVoiceListeningChange = (listening: boolean) => {
    setIsVoiceListening(listening);
  };

  // Handle error from child components
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 56px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8952E0] mx-auto mb-4"></div>
            <p className="text-[#6B7280]">Initializing conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isInitialized) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 56px)' }}>
          <div className="text-center max-w-md px-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-[#1D2025] mb-2">
              Failed to Load Conversation
            </h2>
            <p className="text-[#6B7280] mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#8952E0] text-white px-6 py-2 rounded-md hover:bg-[#7A47CC] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sessionId = conversationData?.conversation?.session_id || 'session-1';
  const roadmapId = 'roadmap-1';

  // Combine conversation messages with next_question
  const messages = conversationData?.conversation?.messages || [];
  const displayMessages = [...messages];

  // Add next_question as the latest AI message if it exists and is different from last message
  if (conversationData?.next_question) {
    const lastMessage = messages[messages.length - 1];
    const isNextQuestionNew = !lastMessage ||
                               lastMessage.role !== 'assistant' ||
                               lastMessage.content !== conversationData.next_question;

    if (isNextQuestionNew) {
      displayMessages.push({
        id: `next-question-${Date.now()}`,
        role: 'assistant' as const,
        content: conversationData.next_question,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation - Exact height: 56px */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col px-6 py-6">
          {/* Header with Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1D2025]">
                  Let&apos;s get started
                </h1>
                <p className="text-lg text-[#6B7280] mt-2">
                  I&apos;ll help you build your job description step by step
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-[#E5E7EB]">
                <button
                  onClick={() => setConversationMode('chat')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    conversationMode === 'chat'
                      ? 'bg-[#8952E0] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
                <button
                  onClick={() => setConversationMode('voice')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    conversationMode === 'voice'
                      ? 'bg-[#8952E0] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium">Voice</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">AI is speaking...</p>
                    <p className="text-xs text-blue-600">Listen to the response</p>
                  </div>
                </div>
                <button
                  onClick={stopSpeaking}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <VolumeX className="w-4 h-4" />
                  <span className="text-sm font-medium">Stop</span>
                </button>
              </div>
            )}
          </div>

          {/* Content Area - Chat or Voice (Separate Views) */}
          <div className="flex-1 min-h-0">
            {conversationMode === 'chat' ? (
              <ChatInterface
                messages={displayMessages}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
                disabled={!isInitialized}
                placeholder="Type your answer here..."
              />
            ) : (
              <div className="h-full flex flex-col">
                {/* Voice Widget */}
                <div className="flex-shrink-0 flex items-center justify-center py-8">
                  <VoiceAgentWidget
                    sessionId={sessionId}
                    onVoiceInput={handleVoiceInput}
                    onListeningChange={handleVoiceListeningChange}
                    disabled={!isInitialized || isSendingMessage}
                  />
                </div>

                {/* Chat Display (Read-only in Voice Mode) */}
                <div className="flex-1 min-h-0 mt-4">
                  <div className="h-full bg-white rounded-lg shadow-sm border border-[#E5E7EB] flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[#E5E7EB]">
                      <h2 className="text-lg font-semibold text-[#1D2025]">Conversation</h2>
                      <p className="text-sm text-[#6B7280] mt-1">
                        Your voice inputs appear here
                      </p>
                    </div>

                    {/* Messages Display (Read-only) */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                      {displayMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎤</div>
                            <p className="text-[#6B7280]">Start speaking to see your conversation</p>
                          </div>
                        </div>
                      ) : (
                        displayMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-[#8952E0] text-white'
                                  : 'bg-[#F3F4F6] text-[#1D2025]'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-2 ${
                                  message.role === 'user'
                                    ? 'text-white/70'
                                    : 'text-[#6B7280]'
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Profile Drawer */}
        <ProfileDrawer
          sessionId={sessionId}
          roadmapId={roadmapId}
          roleId={roleId || undefined}
          roleData={conversationData?.role || null}
          isLoadingRole={isLoading}
          onError={handleError}
        />
      </div>
    </div>
  );
}
