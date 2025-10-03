# Chat Interface Implementation Guide

## Overview

The chat interface allows users to have a text-based conversation with the AI assistant to build their job description. This is an alternative to the voice interface and provides a more traditional messaging experience.

---

## Features

### ✅ Implemented Features

1. **Real-time Messaging**
   - Send text messages to AI
   - Receive AI responses
   - Display conversation history

2. **Message Display**
   - User messages (right-aligned, purple background)
   - AI messages (left-aligned, gray background)
   - Timestamps for each message
   - Auto-scroll to latest message

3. **Input Interface**
   - Multi-line textarea with auto-resize
   - Send button with loading state
   - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
   - Character limit handling

4. **Mode Toggle**
   - Switch between Chat and Voice modes
   - Persistent mode selection
   - Smooth transitions

5. **Loading States**
   - "AI is thinking..." indicator
   - Disabled input during message sending
   - Loading spinner on send button

6. **Error Handling**
   - Display error messages
   - Retry failed messages
   - Graceful error recovery

7. **Roadmap Integration**
   - Auto-refresh roadmap after each message
   - Real-time progress updates
   - Section completion tracking

---

## Components

### 1. ChatInterface Component

**Location**: `sally/src/components/chat-interface.tsx`

**Props**:
```typescript
interface ChatInterfaceProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
```

**Features**:
- Message list with auto-scroll
- Multi-line input with auto-resize
- Send button with loading state
- Empty state display
- Timestamp formatting

**Usage**:
```tsx
<ChatInterface
  messages={conversationMessages}
  onSendMessage={handleSendMessage}
  isLoading={isSending}
  disabled={!isInitialized}
  placeholder="Type your answer here..."
/>
```

### 2. Updated ConversationalAIPage

**Location**: `sally/src/app/conversational-ai/page.tsx`

**New Features**:
- Mode toggle (Chat/Voice)
- Message sending handler
- Roadmap refresh trigger
- Error display

---

## User Flow

### 1. Initial Load
```
1. Page loads → Initialize conversation
2. Fetch initial conversation state
3. Display first AI question
4. Show empty chat interface
5. User can start typing
```

### 2. Sending a Message
```
1. User types message
2. User presses Enter or clicks Send
3. Message appears in chat (user side)
4. Loading indicator shows "AI is thinking..."
5. API call to /api/v1/intake/roles/{role_id}/enhance
6. AI response appears in chat
7. Roadmap updates automatically
8. Input field clears and focuses
```

### 3. Mode Switching
```
1. User clicks Voice/Chat toggle
2. Interface switches smoothly
3. Conversation history persists
4. Can switch back anytime
```

---

## API Integration

### Send Message Flow

```typescript
// 1. User sends message
const handleSendMessage = async (message: string) => {
  // 2. Call API
  const response = await conversationalAiApi.sendMessage(roleId, message);
  
  // 3. Update conversation data
  setConversationData(response);
  
  // 4. Trigger roadmap refresh
  setRefreshTrigger(prev => prev + 1);
};
```

### API Request
```http
POST /api/v1/intake/roles/{role_id}/enhance
Content-Type: application/json

{
  "user_message": "Senior Software Engineer"
}
```

### API Response
```json
{
  "role": { /* updated role data */ },
  "conversation": {
    "messages": [
      {
        "id": "msg-1",
        "role": "assistant",
        "content": "Great! What department...",
        "timestamp": "2025-10-03T10:00:00Z"
      },
      {
        "id": "msg-2",
        "role": "user",
        "content": "Senior Software Engineer",
        "timestamp": "2025-10-03T10:01:00Z"
      },
      {
        "id": "msg-3",
        "role": "assistant",
        "content": "Excellent! Now tell me...",
        "timestamp": "2025-10-03T10:01:05Z"
      }
    ]
  },
  "next_question": "Excellent! Now tell me...",
  "completeness_score": 10,
  "is_complete": false
}
```

---

## Styling

### Message Styles

**User Messages**:
- Background: `#8952E0` (purple)
- Text: White
- Alignment: Right
- Max width: 80%

**AI Messages**:
- Background: `#F3F4F6` (light gray)
- Text: `#1D2025` (dark)
- Alignment: Left
- Max width: 80%

**Timestamps**:
- Font size: 12px
- Opacity: 70%
- Format: "10:30 AM"

### Input Area

- Border: `#D1D5DB`
- Focus ring: `#8952E0`
- Min height: 48px
- Max height: 128px (auto-resize)
- Padding: 12px 16px

### Send Button

- Background: `#8952E0`
- Hover: `#7A47CC`
- Size: 48x48px
- Icon: Send (lucide-react)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Escape` | Clear input (future) |

---

## State Management

### Conversation State
```typescript
const [conversationData, setConversationData] = 
  useState<RoleEnhancementResponse | null>(null);
```

### Message Sending State
```typescript
const [isSendingMessage, setIsSendingMessage] = useState(false);
```

### Mode State
```typescript
const [conversationMode, setConversationMode] = 
  useState<'chat' | 'voice'>('chat');
```

### Refresh Trigger
```typescript
const [refreshTrigger, setRefreshTrigger] = useState(0);
```

---

## Error Handling

### Network Errors
```typescript
try {
  await conversationalAiApi.sendMessage(roleId, message);
} catch (err) {
  // Display error to user
  setError(err.message);
  // Re-throw to let ChatInterface handle it
  throw err;
}
```

### Validation Errors (422)
```typescript
if (error.status === 422) {
  // Parse validation details
  const details = error.details.detail;
  // Show specific field errors
}
```

### Display Errors
- Red banner at top of page
- Inline error in chat (future)
- Toast notifications (future)

---

## Testing

### Manual Testing Checklist

- [ ] Chat interface loads correctly
- [ ] Can send messages
- [ ] Messages appear in correct order
- [ ] AI responses display properly
- [ ] Timestamps are formatted correctly
- [ ] Auto-scroll works
- [ ] Input auto-resizes
- [ ] Send button shows loading state
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Mode toggle works
- [ ] Roadmap updates after message
- [ ] Error messages display
- [ ] Can retry after error

### Test Scenarios

**Scenario 1: First Message**
1. Load page
2. Type "Senior Software Engineer"
3. Press Enter
4. Verify message appears
5. Verify AI response appears
6. Verify roadmap updates

**Scenario 2: Multiple Messages**
1. Send 5 messages in sequence
2. Verify all appear in order
3. Verify auto-scroll works
4. Verify roadmap progress increases

**Scenario 3: Error Handling**
1. Stop backend server
2. Try to send message
3. Verify error displays
4. Start backend
5. Retry message
6. Verify success

**Scenario 4: Mode Switching**
1. Send message in chat mode
2. Switch to voice mode
3. Switch back to chat
4. Verify messages persist

---

## Future Enhancements

### Short Term
1. **Message Actions**
   - Copy message
   - Edit last message
   - Delete message

2. **Rich Text**
   - Markdown support
   - Code blocks
   - Lists and formatting

3. **Typing Indicator**
   - Show when AI is typing
   - Animated dots

### Medium Term
1. **Message History**
   - Search messages
   - Filter by date
   - Export conversation

2. **Attachments**
   - Upload files
   - Share images
   - Paste screenshots

3. **Quick Replies**
   - Suggested responses
   - Common answers
   - Templates

### Long Term
1. **Real-time Updates**
   - WebSocket integration
   - Live message streaming
   - Collaborative editing

2. **AI Features**
   - Message suggestions
   - Auto-complete
   - Smart replies

3. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

---

## Troubleshooting

### Issue: Messages not appearing

**Cause**: API not returning messages in correct format

**Solution**: Check API response structure matches `ConversationMessage` type

### Issue: Auto-scroll not working

**Cause**: `messagesEndRef` not attached correctly

**Solution**: Verify ref is on last element in messages list

### Issue: Input not clearing after send

**Cause**: State not updating correctly

**Solution**: Check `setInputValue('')` is called after successful send

### Issue: Roadmap not updating

**Cause**: `refreshTrigger` not incrementing

**Solution**: Verify `setRefreshTrigger(prev => prev + 1)` is called

---

## Performance Considerations

1. **Message Rendering**
   - Use React.memo for message components (future)
   - Virtualize long message lists (future)
   - Lazy load old messages (future)

2. **API Calls**
   - Debounce typing indicators (future)
   - Cache responses (future)
   - Optimize payload size

3. **Auto-scroll**
   - Use `requestAnimationFrame` for smooth scrolling
   - Disable during user scroll
   - Re-enable on new message

---

## Accessibility

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ ARIA labels (to be added)
- ✅ Screen reader support (to be improved)
- ✅ Color contrast compliance

---

## Summary

The chat interface provides a user-friendly way to interact with the AI assistant. It integrates seamlessly with the existing API, updates the roadmap in real-time, and offers a smooth user experience with proper error handling and loading states.

**Status**: ✅ **READY FOR TESTING**

