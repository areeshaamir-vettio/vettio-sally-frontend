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
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsProcessing(false);
      setError(null);
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

      interimTranscriptRef.current = interimTranscript;
      setTranscript(interimTranscript);

      // If we have a final transcript, send it
      if (finalTranscript.trim()) {
        setIsProcessing(true);
        onVoiceInput?.(finalTranscript.trim());
        setTranscript('');
        interimTranscriptRef.current = '';

        // Reset processing state after a delay
        setTimeout(() => setIsProcessing(false), 1000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Don't show error for no-speech, just continue listening
        return;
      }
      setError(`Error: ${event.error}`);
      setIsActive(false);
      onListeningChange?.(false);
    };

    recognition.onend = () => {
      // If still active, restart recognition
      if (isActive && !disabled) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, disabled, onVoiceInput, onListeningChange]);

  const handleToggleVoice = useCallback(() => {
    if (disabled) return;

    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    const newActiveState = !isActive;
    setIsActive(newActiveState);
    onListeningChange?.(newActiveState);

    if (newActiveState) {
      try {
        recognitionRef.current.start();
        setError(null);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition');
        setIsActive(false);
        onListeningChange?.(false);
      }
    } else {
      recognitionRef.current.stop();
      setTranscript('');
      interimTranscriptRef.current = '';
    }
  }, [isActive, disabled, onListeningChange]);

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
            'Or type your message below'
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
