# Session System Guide

This guide explains the job session system that generates and stores fake Job IDs when users click the "Get Started" button.

## Overview

The session system creates a unique Job ID for each user session and stores it persistently in localStorage. This allows tracking user progress through the job creation flow.

## Components

### 1. SessionContext (`src/contexts/SessionContext.tsx`)

The main React context that manages session state:

```typescript
interface SessionData {
  jobId: string | null;
  createdAt: string | null;
  userId: string | null;
}
```

**Key Functions:**
- `generateJobId(userId?)` - Creates a new fake job ID
- `clearSession()` - Clears the current session
- `getJobId()` - Returns the current job ID

### 2. Session Utilities (`src/lib/session-utils.ts`)

Utility functions for accessing session data outside of React components:

- `getCurrentJobId()` - Get current job ID
- `hasActiveJobSession()` - Check if session exists
- `getSessionData()` - Get full session data
- `clearSessionData()` - Clear session
- `logSessionInfo()` - Debug logging

### 3. WelcomeCard Component (`src/components/welcome-card.tsx`)

Updated to generate a job ID when "Get Started" is clicked:

```typescript
const handleGetStarted = () => {
  // Generate a fake job ID and store it in session
  const jobId = generateJobId(user?.id);
  
  console.log('🚀 Starting job creation with ID:', jobId);
  
  // Navigate to company onboarding
  router.push('/company-onboarding');
};
```

## Job ID Format

Job IDs are generated using this format:
```
JOB_{timestamp}_{randomString}
```

Example: `JOB_1704067200000_A1B2C3`

## Storage

Session data is stored in localStorage under the key `vettio_session`:

```json
{
  "jobId": "JOB_1704067200000_A1B2C3",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "userId": "user_1234567890"
}
```

## Usage Examples

### In React Components

```typescript
import { useSession } from '@/contexts/SessionContext';

function MyComponent() {
  const { sessionData, generateJobId, clearSession } = useSession();
  
  // Check if session exists
  if (sessionData.jobId) {
    console.log('Current job ID:', sessionData.jobId);
  }
  
  // Generate new session
  const newJobId = generateJobId(user?.id);
  
  // Clear session
  clearSession();
}
```

### Using Utility Functions

```typescript
import { getCurrentJobId, hasActiveJobSession } from '@/lib/session-utils';

// Check if user has active session
if (hasActiveJobSession()) {
  const jobId = getCurrentJobId();
  console.log('Active job:', jobId);
}
```

### Browser Console

```javascript
// Check current session
window.sessionUtils.logSessionInfo()

// Get current job ID
window.sessionUtils.getCurrentJobId()

// Check if session exists
window.sessionUtils.hasActiveJobSession()

// Clear session
window.sessionUtils.clearSessionData()

// Check if user reached conversational-ai
window.sessionUtils.hasReachedConversationalAI()

// Reset conversational-ai flag (to show debug widget again)
window.sessionUtils.resetConversationalAIFlag()

// Manually mark as reached conversational-ai
window.sessionUtils.markReachedConversationalAI()
```

## Session Debug Widget

The session debug widget appears **from the get-started page until the user reaches conversational-ai**, then it's permanently hidden while maintaining the session state.

### Widget Behavior:
- **Shows on**: `/get-started`, `/company-onboarding`, and any pages in the flow
- **Hides when**: User reaches `/conversational-ai` page
- **State**: Session data remains intact even after widget is hidden
- **Reset**: Use `window.sessionUtils.resetConversationalAIFlag()` to show widget again

## Testing

### 1. Test Page

Visit `/test-session` to see a comprehensive testing interface that shows:
- Current session information
- Session generation controls
- Session history
- Console commands

### 2. Get Started Flow

1. Navigate to `/get-started`
2. Click the "Get Started" button
3. Check browser console for session logs
4. Inspect localStorage for `vettio_session` key
5. Navigate through the flow to see debug widget
6. Reach `/conversational-ai` to see widget disappear

### 3. Development Debug

In development mode, a debug widget appears globally showing:
- Current job ID
- Creation timestamp
- Associated user
- Clear session button
- Automatically hides once user reaches conversational-ai

## Integration Points

### Current Integration

- **WelcomeCard**: Generates job ID on "Get Started" click
- **SessionDebug**: Shows session info in development
- **Browser Console**: Utilities available for debugging

### Potential Future Integrations

- **API Calls**: Include job ID in API requests
- **Analytics**: Track user progress by job ID
- **State Management**: Use job ID for form state persistence
- **Navigation**: Conditional routing based on session state

## Session Lifecycle

1. **Creation**: User clicks "Get Started" button
2. **Storage**: Job ID stored in localStorage with timestamp and user ID
3. **Persistence**: Session survives page refreshes and browser restarts
4. **Usage**: Job ID available throughout the application
5. **Cleanup**: Session can be manually cleared or expires naturally

## Security Considerations

- Job IDs are client-side only and not sensitive
- No authentication tokens stored in session
- Session data is not transmitted to backend automatically
- Users can manually clear session data

## Debugging

### Console Logging

The system provides extensive console logging:
- Job ID generation: `🆔 Generated new Job ID: ...`
- Session creation: `📅 Session created at: ...`
- User association: `👤 Associated with user: ...`
- Session clearing: `🗑️ Session cleared`

### Development Tools

1. **Session Debug Widget**: Visual session info on get-started page
2. **Test Page**: Comprehensive testing interface at `/test-session`
3. **Browser Console**: `window.sessionUtils` for manual testing
4. **localStorage Inspector**: Check `vettio_session` key in dev tools

## Error Handling

- Invalid session data is automatically cleared
- Missing session gracefully handled (returns null)
- Console errors logged for debugging
- Fallback behavior when localStorage unavailable

## Performance

- Minimal overhead (localStorage operations)
- No network requests for session management
- Efficient React context updates
- Lazy loading of session utilities
