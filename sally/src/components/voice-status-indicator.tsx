'use client';

import Image from 'next/image';

interface VoiceStatusIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript?: string;
  error?: string | null;
}

export function VoiceStatusIndicator({
  isListening,
  isSpeaking,
  transcript,
  error,
}: VoiceStatusIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated Background Ellipse - No Icon Overlay */}
      <div className="relative flex items-center justify-center mb-6">
        <Image
          src="/assets/Ellipse.svg"
          alt="Voice Agent"
          width={400}
          height={400}
          className={`transition-all duration-500 ${
            isListening || isSpeaking ? 'scale-110 opacity-90' : 'scale-100 opacity-80'
          } ${isSpeaking ? 'animate-pulse' : ''}`}
          priority
        />
      </div>

      {/* Status Text */}
      <div className="text-center mb-4">
        <p className="text-lg font-medium text-[#1D2025] mb-2">
          {error ? (
            'Voice recognition unavailable'
          ) : isSpeaking ? (
            'AI is speaking...'
          ) : isListening ? (
            'Listening...'
          ) : (
            'Initializing...'
          )}
        </p>
        <p className="text-sm text-[#6B7280]">
          {error ? (
            error
          ) : isSpeaking ? (
            'Please wait for the question to finish'
          ) : isListening ? (
            "Speak naturally - I'm listening"
          ) : (
            'Getting ready...'
          )}
        </p>
      </div>

      {/* Live Transcript Display */}
      {isListening && transcript && transcript.trim() && (
        <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] mb-4">
          <p className="text-xs text-[#8952E0] font-medium mb-1">You&apos;re saying:</p>
          <p className="text-sm text-[#1D2025] italic">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Voice Visualization - Animated Bars */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-[#8952E0] rounded-full transition-all duration-300 ${
                transcript && transcript.trim() ? 'h-8 animate-bounce' : 'h-4'
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <p className="text-sm text-red-700">
            {error.includes('permission') || error.includes('not-allowed') ? (
              <>
                Please allow microphone access in your browser settings and refresh the page.
              </>
            ) : error.includes('not supported') || error.includes('not available') ? (
              <>
                Your browser doesn&apos;t support voice recognition. Please use Chrome, Safari, or Edge.
              </>
            ) : (
              <>
                {error}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

