'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import Image from 'next/image';

interface VoiceAgentWidgetProps {
  sessionId: string;
  onVoiceInput?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

export function VoiceAgentWidget({
  onVoiceInput,
  onListeningChange,
  disabled = false,
}: VoiceAgentWidgetProps) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const interimTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Renamed for clarity
  const isActiveRef = useRef(false); // Track active state in ref to avoid dependency issues

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Only English language support
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsProcessing(false);
      setError(null);
      console.log('✅ Speech recognition started successfully');
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

      // Log any speech detected
      if (interimTranscript || finalTranscript) {
        console.log('🎙️ Speech detected - Interim:', interimTranscript, 'Final:', finalTranscript);
      }

      // If we have a final transcript, accumulate it
      if (finalTranscript.trim()) {
        // Accumulate final transcripts (don't replace)
        finalTranscriptRef.current += finalTranscript;
        console.log('🎤 Accumulated transcript:', finalTranscriptRef.current);

        // Clear existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Auto-send after 2 seconds of silence
        silenceTimeoutRef.current = setTimeout(() => {
          const textToSend = finalTranscriptRef.current.trim();

          if (textToSend) {
            console.log('🎤 Sending voice input after 2s silence:', textToSend);
            onVoiceInput?.(textToSend);

            // Clear transcript after sending
            finalTranscriptRef.current = '';
            setTranscript('');
          }
        }, 2000);
      }

      // Show combined final + interim results in real-time
      const displayText = finalTranscriptRef.current + interimTranscript;
      setTranscript(displayText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech recognition error:', event.error);

      if (event.error === 'no-speech') {
        // Don't show error for no-speech, just continue listening
        console.log('ℹ️ No speech detected, continuing to listen...');
        return;
      }

      if (event.error === 'aborted') {
        // Recognition was aborted (e.g., user stopped it)
        console.log('ℹ️ Speech recognition aborted');
        return;
      }

      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
        setIsActive(false);
        isActiveRef.current = false;
        onListeningChange?.(false);
        return;
      }

      setError(`Error: ${event.error}`);
      setIsActive(false);
      isActiveRef.current = false;
      onListeningChange?.(false);
    };

    recognition.onend = () => {
      // If still active, restart recognition
      // Use ref to avoid stale closure
      if (isActiveRef.current && !disabled) {
        try {
          console.log('🔄 Recognition ended, restarting...');
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      } else {
        console.log('🛑 Recognition ended, not restarting (isActive:', isActiveRef.current, ')');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      // Clear any pending silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [disabled, onVoiceInput, onListeningChange]); // Removed isActive from dependencies

  const handleToggleVoice = useCallback(() => {
    if (disabled) return;

    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    const newActiveState = !isActive;

    if (newActiveState) {
      // Starting voice input
      // IMPORTANT: Notify parent FIRST to stop AI speech immediately
      onListeningChange?.(true);

      // Then update state and ref, clear transcripts
      setIsActive(true);
      isActiveRef.current = true; // Sync ref
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setTranscript('');

      try {
        recognitionRef.current.start();
        setError(null);
        console.log('🎤 Voice input started - AI speech stopped');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition');
        setIsActive(false);
        isActiveRef.current = false; // Sync ref
        onListeningChange?.(false);
      }
    } else {
      // Stopping voice input
      // Notify parent first
      onListeningChange?.(false);

      // Stop recognition
      setIsActive(false);
      isActiveRef.current = false; // Sync ref
      recognitionRef.current.stop();

      // Clear any pending silence timeout when stopping
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      // Send the accumulated transcript if we have any
      const textToSend = finalTranscriptRef.current.trim();
      if (textToSend) {
        setIsProcessing(true);
        console.log('🎤 Sending accumulated voice input on mic stop:', textToSend);
        onVoiceInput?.(textToSend);

        // Reset processing state after a delay
        setTimeout(() => setIsProcessing(false), 1000);
      } else {
        console.log('🎤 Voice input stopped - no text captured');
      }

      // Clear all transcripts
      setTranscript('');
      interimTranscriptRef.current = '';
      finalTranscriptRef.current = '';
    }
  }, [isActive, disabled, onListeningChange, onVoiceInput]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Voice Agent Widget */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Animated Background Ellipse */}
        <div className="relative">
          <Image
            src="/assets/Ellipse.svg"
            alt="Voice Agent"
            width={400}
            height={400}
            className={`transition-all duration-500 ${
              isActive ? 'scale-110 opacity-90' : 'scale-100 opacity-80'
            } ${isProcessing ? 'animate-pulse' : ''}`}
          />

          {/* Voice Control Button */}
          <button
            onClick={handleToggleVoice}
            disabled={disabled || !!error}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${disabled || error
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isActive
                ? 'bg-white text-[#8952E0] shadow-lg scale-110'
                : 'bg-[#8952E0] text-white hover:bg-[#7A47CC]'
              }`}
          >
            {isActive ? (
              isProcessing ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8" />
              )
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mb-4">
        <p className="text-lg font-medium text-[#1D2025] mb-2">
          {error ? (
            'Voice recognition unavailable'
          ) : isActive ? (
            isProcessing ? 'Processing...' : 'Listening...'
          ) : (
            'Click microphone to speak'
          )}
        </p>
        <p className="text-sm text-[#6B7280]">
          {error ? (
            error
          ) : isActive ? (
            'Speak naturally about your job requirements'
          ) : (
            '' // Removed "Or type your message below" text
          )}
        </p>
      </div>

      {/* Live Transcript Display */}
      {isActive && transcript && (
        <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] mb-4">
          <p className="text-xs text-[#8952E0] font-medium mb-1">You&apos;re saying:</p>
          <p className="text-sm text-[#1D2025] italic">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Voice Visualization */}
      {isActive && (
        <div className="flex items-center justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-[#8952E0] rounded-full transition-all duration-300 ${
                transcript || isProcessing
                  ? 'h-8 animate-bounce'
                  : 'h-4'
              }`}
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
