'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ConversationMessage } from '@/types/role-enhancement';

interface ChatInterfaceProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message here...',
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    setInputValue('');

    try {
      await onSendMessage(trimmedMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setInputValue(trimmedMessage);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-lg font-semibold text-[#1D2025]">Conversation</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Chat with AI to build your job description
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-[#6B7280]">No messages yet</p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Start the conversation below
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
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
                  {/* Message Content */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-white/70'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>

                  {/* Metadata (optional - for debugging) */}
                  {message.metadata?.target_field && (
                    <p
                      className={`text-xs mt-1 italic ${
                        message.role === 'user'
                          ? 'text-white/60'
                          : 'text-[#9CA3AF]'
                      }`}
                    >
                      Target: {message.metadata.target_field}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {(isLoading || isSending) && (
              <div className="flex justify-start">
                <div className="bg-[#F3F4F6] rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8952E0]" />
                    <span className="text-sm text-[#6B7280]">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-[#E5E7EB]">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Textarea */}
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg bg-white text-[#1D2025] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-[#8952E0] disabled:bg-gray-50 disabled:cursor-not-allowed resize-none max-h-32"
              style={{ minHeight: '48px' }}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending || disabled}
            className="bg-[#8952E0] text-white p-3 rounded-lg hover:bg-[#7A47CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

