'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { VoiceStatusIndicator } from '@/components/voice-status-indicator';
// import { ChatInterface } from '@/components/chat-interface';
import { ProfileDrawer } from '@/components/profile-drawer';
import { conversationalAiApi, ConversationalApiError } from '@/lib/conversational-ai-api';
import { RoleEnhancementResponse } from '@/types/role-enhancement';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export default function ConversationalAIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get role ID from URL query parameter
  const [roleId, setRoleId] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<RoleEnhancementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);

  // Voice recognition state
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const pendingQuestionRef = useRef<string | null>(null);
  const hasSpokenInitialQuestion = useRef<boolean>(false);
  const isRecognitionActive = useRef<boolean>(false);
  const shouldPreventRestart = useRef<boolean>(false);

  // Text-to-Speech function with female voice configuration
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Function to actually speak
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      // Only English language support
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Configure female voice for professional hiring recruiter sound
      const voices = window.speechSynthesis.getVoices();

      // Preferred female voice names (professional sounding)
      const preferredFemaleVoices = [
        'Samantha',
        'Victoria',
        'Karen',
        'Moira',
        'Fiona',
        'Google US English Female',
        'Microsoft Zira',
        'Female'
      ];

      // Find a female voice
      let selectedVoice = voices.find(voice => {
        const voiceName = voice.name.toLowerCase();
        return preferredFemaleVoices.some(preferred =>
          voiceName.includes(preferred.toLowerCase())
        );
      });

      // Fallback: try to find any voice with "female" in the name
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('female')
        );
      }

      // Fallback: try to find any voice with "woman" in the name
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('woman')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Using voice:', selectedVoice.name);
      } else {
        console.log('🎤 No specific female voice found, using default en-US voice');
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Speech started');

        // Reset the prevent restart flag now that speech has started
        shouldPreventRestart.current = false;

        // Pause voice recognition to prevent echo
        if (recognitionRef.current && isRecognitionActive.current) {
          try {
            recognitionRef.current.stop();
            isRecognitionActive.current = false;
            console.log('⏸️ Voice recognition paused during agent speech');
          } catch (err) {
            console.error('Failed to pause recognition:', err);
          }
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('✅ Speech ended');

        // Resume voice recognition automatically after a short delay
        if (recognitionRef.current && isInitialized) {
          try {
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                console.log('▶️ Voice recognition resumed automatically');
              }
            }, 300); // 300ms delay to ensure speech has fully stopped
          } catch (err) {
            console.error('Failed to resume recognition:', err);
          }
        }
      };

      utterance.onerror = (event) => {
        // Don't log "interrupted" error - it's expected when user starts speaking
        if (event.error === 'interrupted') {
          console.log('ℹ️ Speech interrupted (user started speaking)');
          setIsSpeaking(false);
          return;
        }

        // Handle "not-allowed" error (browser autoplay policy)
        if (event.error === 'not-allowed') {
          console.log('⚠️ Speech blocked by browser autoplay policy');
          console.log('ℹ️ Speech will start when microphone permission is granted');
          setIsSpeaking(false);

          // Store the text to speak later
          if (!hasSpokenInitialQuestion.current) {
            pendingQuestionRef.current = text;
            console.log('📝 Stored pending question to speak after mic permission');
          }

          return;
        }

        console.error('❌ Speech synthesis error:', event.error);
        setIsSpeaking(false);

        // Retry once if it's a network or synthesis error
        if (event.error === 'network' || event.error === 'synthesis-failed') {
          console.log('🔄 Retrying speech...');
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        }
      };

      console.log('🔊 Starting speech synthesis...');
      window.speechSynthesis.speak(utterance);
    };

    // If voices are not loaded yet, wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ Waiting for voices to load...');
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('✅ Voices loaded, speaking now');
        doSpeak();
      };
    } else {
      doSpeak();
    }
  };

  // Stop speech function
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initialize audio context on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize speech synthesis by loading voices
    const initAudio = () => {
      if (window.speechSynthesis) {
        // Trigger voices loading
        window.speechSynthesis.getVoices();
        setAudioContextInitialized(true);
        console.log('✅ Audio context initialized');
      }
    };

    // Try to initialize immediately
    initAudio();

    // Also listen for voices changed event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = initAudio;
    }

    // No need to wait for user interaction - we'll handle autoplay blocking in error handler
  }, []);

  // Extract role ID from URL query parameter on mount
  useEffect(() => {
    const roleIdParam = searchParams.get('roleId');

    if (!roleIdParam) {
      console.warn('⚠️ No role ID found in URL. Redirecting to job description page...');
      setError('No role found. Please start by creating a job description.');
      // Redirect to job description page after a short delay
      setTimeout(() => {
        router.push('/job-description');
      }, 2000);
      return;
    }

    console.log('✅ Loaded role ID from URL:', roleIdParam);
    setRoleId(roleIdParam);
  }, [router, searchParams]);

  // Initialize conversation when role ID is available
  useEffect(() => {
    if (!roleId) {
      // Silent return - roleId will be set by the first useEffect
      return;
    }

    const initializeConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 ConversationalAI: Initializing conversation for roleId:', roleId);
        console.log('🔄 Calling API: GET /api/v1/intake/roles/' + roleId);

        // Start or get existing conversation
        const response = await conversationalAiApi.startConversation(roleId);

        console.log('✅ ConversationalAI: Conversation initialized successfully');
        console.log('📊 Initial data:', {
          hasRole: !!response.role,
          hasConversation: !!response.conversation,
          hasNextQuestion: !!response.next_question,
          completenessScore: response.completeness_score,
          isComplete: response.is_complete,
          completedSections: response.role?.completed_sections?.length || 0,
          currentSection: response.role?.current_section,
          remainingSections: response.role?.remaining_sections?.length || 0,
          messageCount: response.conversation?.messages?.length || 0
        });

        setConversationData(response);
        setIsInitialized(true);

        // Auto-speak initial question immediately on page load
        if (response.next_question) {
          console.log('🔊 Auto-speaking initial question on page load');

          // Small delay to ensure audio context is ready
          setTimeout(() => {
            speakText(response.next_question);
            hasSpokenInitialQuestion.current = true;
          }, 500);
        }
      } catch (err) {
        console.error('❌ ConversationalAI: Failed to initialize conversation - Full error:', err);

        if (err instanceof ConversationalApiError) {
          console.error('❌ API Error Details:', {
            message: err.message,
            status: err.status,
            details: err.details
          });
        }

        const errorMessage = err instanceof ConversationalApiError
          ? `API Error: ${err.message} (Status: ${err.status})`
          : err instanceof Error
          ? `Error: ${err.message}`
          : 'Failed to initialize conversation. Please try again.';

        console.error('❌ User-facing error message:', errorMessage);
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

  // Auto-start voice recognition after conversation is initialized
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.');
      console.error('❌ Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecognitionActive.current = true;
      setIsVoiceListening(true);
      console.log('✅ Voice recognition started automatically');

      // If there's a pending question (blocked by autoplay), speak it now
      if (pendingQuestionRef.current && !hasSpokenInitialQuestion.current) {
        console.log('🔊 Speaking pending initial question now that mic is active');
        const questionToSpeak = pendingQuestionRef.current;
        pendingQuestionRef.current = null;
        hasSpokenInitialQuestion.current = true;

        // Small delay to ensure mic permission is fully granted
        setTimeout(() => {
          speakText(questionToSpeak);
        }, 100);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        // Accumulate final transcripts using ref
        accumulatedTranscriptRef.current += finalTranscript;
        console.log('🎤 Accumulated transcript:', accumulatedTranscriptRef.current);

        // Update current transcript for display
        setCurrentTranscript(accumulatedTranscriptRef.current + interimTranscript);

        // Clear existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Auto-send after 0.5 seconds of silence
        silenceTimeoutRef.current = setTimeout(() => {
          const textToSend = accumulatedTranscriptRef.current.trim();

          if (textToSend) {
            console.log('🎤 Sending voice input after 0.5s silence:', textToSend);
            handleVoiceInput(textToSend);

            // Clear accumulated transcript after sending
            accumulatedTranscriptRef.current = '';
            setCurrentTranscript('');
          }
        }, 500); // 0.5 seconds
      } else {
        // Show interim results
        setCurrentTranscript(accumulatedTranscriptRef.current + interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Handle expected/harmless errors silently
      if (event.error === 'no-speech') {
        console.log('ℹ️ No speech detected, continuing to listen...');
        return;
      }

      if (event.error === 'aborted') {
        console.log('ℹ️ Speech recognition aborted (expected when stopping)');
        return;
      }

      // Handle permission errors
      if (event.error === 'not-allowed') {
        console.error('❌ Speech recognition error:', event.error);
        setVoiceError('Microphone permission denied. Please allow microphone access and refresh the page.');
        setIsVoiceListening(false);
        return;
      }

      // Log and handle unexpected errors
      console.error('❌ Speech recognition error:', event.error);
      setVoiceError(`Voice recognition error: ${event.error}`);
      setIsVoiceListening(false);
    };

    recognition.onend = () => {
      isRecognitionActive.current = false;

      // Don't auto-restart if we're about to speak a response
      if (shouldPreventRestart.current) {
        console.log('🛑 Recognition ended, not restarting (about to speak response)');
        setIsVoiceListening(false);
        return;
      }

      // Auto-restart if still initialized and not speaking
      if (isInitialized && !isSpeaking) {
        try {
          console.log('🔄 Recognition ended, restarting...');
          // Small delay to ensure clean restart
          setTimeout(() => {
            if (!isRecognitionActive.current && !isSpeaking && !shouldPreventRestart.current) {
              try {
                recognition.start();
              } catch (restartErr: any) {
                if (restartErr?.message?.includes('already started')) {
                  console.log('ℹ️ Recognition already restarted elsewhere');
                } else {
                  console.error('Failed to restart recognition:', restartErr);
                }
              }
            }
          }, 100);
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      } else {
        console.log('🛑 Recognition ended, not restarting (speaking or not initialized)');
        setIsVoiceListening(false);
      }
    };

    recognitionRef.current = recognition;

    // Start recognition automatically after a short delay
    // This delay ensures the initial question has started speaking
    const startDelay = setTimeout(() => {
      try {
        // Don't start if agent is speaking or if recognition is already active
        if (!isSpeaking && !isRecognitionActive.current) {
          recognition.start();
          console.log('🎤 Auto-started voice recognition');
        } else if (isRecognitionActive.current) {
          console.log('ℹ️ Recognition already active, skipping auto-start');
        } else {
          console.log('⏸️ Delaying voice recognition start (agent is speaking)');
        }
      } catch (err: any) {
        // Only show error if it's not an "already started" error
        if (err?.message?.includes('already started')) {
          console.log('ℹ️ Recognition already started (caught in try-catch), continuing...');
        } else {
          console.error('Failed to start recognition:', err);
          setVoiceError('Failed to start voice recognition. Please check microphone permissions.');
        }
      }
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(startDelay);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          isRecognitionActive.current = false;
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, [isInitialized, isSpeaking]);

  // Handle sending a message with enhanced error logging
  const handleSendMessage = async (message: string) => {
    console.log('🚀 handleSendMessage called with message:', message);

    if (!message.trim() || isSendingMessage || !roleId) {
      console.warn('⚠️ Cannot send message:', {
        hasMessage: !!message.trim(),
        isSendingMessage,
        hasRoleId: !!roleId
      });
      return;
    }

    console.log('📤 Sending message:', {
      roleId,
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      messageLength: message.length
    });

    try {
      setIsSendingMessage(true);
      setError(null);

      // Optimistic update: Add user message immediately to the UI
      if (conversationData) {
        const optimisticUserMessage = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString(),
        };

        // Safely handle messages array - it might be undefined or not an array
        const existingMessages = Array.isArray(conversationData.conversation?.messages)
          ? conversationData.conversation.messages
          : [];

        setConversationData({
          ...conversationData,
          conversation: {
            ...conversationData.conversation,
            messages: [...existingMessages, optimisticUserMessage],
          },
        });
      }

      // Send message to API with detailed logging
      console.log('🔄 Calling API: POST /api/v1/intake/roles/' + roleId + '/enhance');
      console.log('📦 Request payload:', { user_message: message });

      const response = await conversationalAiApi.sendMessage(roleId, message);

      console.log('✅ API response received:', {
        hasRole: !!response.role,
        hasConversation: !!response.conversation,
        hasNextQuestion: !!response.next_question,
        completenessScore: response.completeness_score,
        isComplete: response.is_complete,
        completedSections: response.role?.completed_sections?.length || 0,
        currentSection: response.role?.current_section,
        remainingSections: response.role?.remaining_sections?.length || 0
      });

      // Update conversation data with actual API response
      // This will replace the optimistic update with real data
      setConversationData(response);

      // Speak the AI's response immediately
      if (response.next_question) {
        console.log('🔊 Auto-speaking AI response after message send');
        speakText(response.next_question);
      }
    } catch (err) {
      // Enhanced error logging
      console.error('❌ Failed to send message - Full error:', err);

      if (err instanceof ConversationalApiError) {
        console.error('❌ API Error Details:', {
          message: err.message,
          status: err.status,
          details: err.details
        });
      }

      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.error('❌ Network error - API might be unreachable');
      }

      const errorMessage = err instanceof ConversationalApiError
        ? `API Error: ${err.message} (Status: ${err.status})`
        : err instanceof Error
        ? `Error: ${err.message}`
        : 'Failed to send message. Please try again.';

      console.error('❌ User-facing error message:', errorMessage);
      setError(errorMessage);

      // Rollback optimistic update on error
      // The API response should contain the correct state, but if it fails
      // we should ideally remove the optimistic message
      throw err; // Re-throw to let ChatInterface handle it
    } finally {
      setIsSendingMessage(false);
      console.log('✅ Message send operation completed');
    }
  };

  // Handle voice input - same as text message
  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    console.log('🎤 Voice input received:', transcript);

    // Prevent auto-restart while we're about to speak the response
    shouldPreventRestart.current = true;

    // Stop voice recognition before sending message
    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
        isRecognitionActive.current = false;
        console.log('⏸️ Voice recognition stopped for message send');
      } catch (err) {
        console.error('Failed to stop recognition:', err);
      }
    }

    await handleSendMessage(transcript);
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

  // Chat interface hidden - voice-only mode
  // const messages = conversationData?.conversation?.messages || [];

  // // Ensure all messages have unique IDs
  // const displayMessages = messages.map((msg, index) => ({
  //   ...msg,
  //   id: msg.id || `msg-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  // }));

  // // Add next_question as the latest AI message if it exists and is different from last message
  // if (conversationData?.next_question) {
  //   const lastMessage = messages[messages.length - 1];
  //   const isNextQuestionNew = !lastMessage ||
  //                              lastMessage.role !== 'assistant' ||
  //                              lastMessage.content !== conversationData.next_question;

  //   if (isNextQuestionNew) {
  //     displayMessages.push({
  //       id: `next-question-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  //       role: 'assistant' as const,
  //       content: conversationData.next_question,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }

  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation - Exact height: 56px */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col px-6 py-6">
          {/* Header - Centered */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-black leading-9">
                Let&apos;s get started
              </h1>
            </div>

            {/* Voice Status Indicator - No Button, Fully Automatic */}
            <div className="flex items-center justify-center">
              <VoiceStatusIndicator
                isListening={isVoiceListening}
                isSpeaking={isSpeaking}
                transcript={currentTranscript}
                error={voiceError}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-between">
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
              </div>
            )}
          </div>

          {/* Chat Interface - Hidden (voice-only mode) */}
          {/* <div className="mt-8 max-w-4xl mx-auto w-full">
            <ChatInterface
              messages={displayMessages}
              onSendMessage={handleSendMessage}
              isLoading={isSendingMessage}
              disabled={!isInitialized}
              placeholder="Type your answer here..."
            />
          </div> */}
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
