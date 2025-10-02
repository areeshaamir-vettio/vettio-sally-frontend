'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import Image from 'next/image';

interface VoiceAgentWidgetProps {
  sessionId: string;
  isListening?: boolean;
  onToggleListening?: () => void;
}

export function VoiceAgentWidget({
  sessionId,
  isListening = false,
  onToggleListening
}: VoiceAgentWidgetProps) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleVoice = () => {
    setIsActive(!isActive);
    onToggleListening?.();
  };

  // Simulate voice processing
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {/* Voice Agent Widget */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Animated Background Ellipse */}
        <div className="relative">
          <Image
            src="/assets/Ellipse.svg"
            alt="Voice Agent"
            width={500}
            height={500}
            className={`transition-all duration-500 ${
              isActive ? 'scale-110 opacity-90' : 'scale-100 opacity-80'
            } ${isProcessing ? 'animate-pulse' : ''}`}
          />

          {/* Voice Control Button */}
          <button
            onClick={handleToggleVoice}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${isActive
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
      <div className="text-center">
        <p className="text-lg font-medium text-[#1D2025] mb-2">
          {isActive
            ? (isProcessing ? 'Processing...' : 'Listening...')
            : 'Click to start voice conversation'
          }
        </p>
        <p className="text-sm text-[#6B7280]">
          {isActive
            ? 'Speak naturally about your job requirements'
            : ''
          }
        </p>
      </div>

      {/* Voice Visualization */}
      {isActive && (
        <div className="flex items-center justify-center mt-6 space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-[#8952E0] rounded-full transition-all duration-300 ${
                isProcessing
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
