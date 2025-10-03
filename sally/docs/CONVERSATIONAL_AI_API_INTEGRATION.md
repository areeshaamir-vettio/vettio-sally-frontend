# Conversational AI API Integration Documentation

## Overview

This document describes the integration of the Role Enhancement API with the Conversational AI page at `/conversational-ai`.

## Architecture

### Components

1. **Type Definitions** (`src/types/role-enhancement.ts`)
   - Defines all TypeScript interfaces matching the API response structure
   - Includes role sections, conversation data, and error types
   - Provides section metadata for mapping

2. **Type Mappers** (`src/lib/mappers/role-enhancement-mapper.ts`)
   - Transforms API responses to component-friendly formats
   - Maps role sections to roadmap steps
   - Converts conversation data to session format

3. **API Client** (`src/lib/conversational-ai-api.ts`)
   - Handles all API communication
   - Provides methods for conversation management
   - Includes error handling and validation

4. **Updated Components**
   - `src/app/conversational-ai/page.tsx` - Main page with state management
   - `src/components/roadmap.tsx` - Displays role completion progress
   - `src/components/profile-drawer.tsx` - Sidebar with roadmap and pause button

## API Endpoints

### 1. Start/Get Conversation
```
GET /api/v1/intake/roles/{role_id}
```
- Initializes a new conversation or retrieves existing state
- Returns complete role data and conversation history
- Provides the next question to ask the user

### 2. Send Message
```
POST /api/v1/intake/roles/{role_id}/enhance
Body: { "user_message": "string" }
```
- Sends user message to the AI
- Returns updated role data and AI response
- Includes next question and completion status

### 3. Get Conversation State
```
GET /api/v1/intake/roles/{role_id}
```
- Same as endpoint #1
- Used to refresh conversation state

### 4. Pause Conversation
```
POST /api/v1/intake/roles/{role_id}/pause
```
- **Note**: Not yet implemented in backend
- Currently returns mock success response
- Will be implemented in future

## Configuration

### Environment Variables

Create a `.env.local` file in the `sally` directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

For production, update the URL accordingly.

### Role ID Configuration

Currently, the role ID is hardcoded in `src/app/conversational-ai/page.tsx`:

```typescript
const DEFAULT_ROLE_ID = 'gSMy88JCwIFlQlzgbs4c';
```

**TODO**: Update to accept role ID from:
- URL query parameters: `/conversational-ai?roleId=xxx`
- Route parameters: `/conversational-ai/[roleId]`
- Props from parent component

## Data Flow

```
1. Page loads → startConversation(roleId)
2. API returns role data + conversation + next_question
3. Mappers transform data → Roadmap steps + Session
4. Components render with transformed data
5. User interacts → sendMessage(roleId, message)
6. API returns updated data
7. Components re-render with new state
```

## Error Handling

### API Errors

The API client handles the following error types:

1. **Validation Errors (422)**
   ```json
   {
     "detail": [
       {
         "loc": ["string", 0],
         "msg": "string",
         "type": "string"
       }
     ]
   }
   ```

2. **Network Errors**
   - Connection failures
   - Timeout errors
   - DNS resolution issues

3. **Server Errors (5xx)**
   - Internal server errors
   - Service unavailable

### Error Display

- Loading states: Spinner with message
- Error states: Error message with retry button
- Component errors: Inline error messages

## Authentication

Authentication is prepared but currently disabled:

```typescript
// In conversational-ai-api.ts
// TODO: Uncomment when authentication is required
// if (this.authToken) {
//   headers['Authorization'] = `Bearer ${this.authToken}`;
// }
```

To enable authentication:
1. Uncomment the authorization header code
2. Set auth token: `conversationalAiApi.setAuthToken(token)`
3. Handle 401 responses appropriately

## Role Sections

The API tracks 10 sections of role information:

1. **Basic Information** - Title, department, location, etc.
2. **Role Purpose** - Mission, impact, objectives
3. **Key Responsibilities** - Main duties and outcomes
4. **Skills & Qualifications** - Required and preferred skills
5. **Role Context** - Team, company, industry info
6. **Performance & KPIs** - Success metrics
7. **Compensation & Benefits** - Salary, benefits, perks
8. **Culture & Value Fit** - Company culture alignment
9. **Hiring Practicalities** - Timeline, urgency, budget
10. **Approval & Notes** - Workflow state, approvals

Each section tracks:
- Completion status
- Completion percentage
- Missing fields
- Field values

## Usage Examples

### Initialize Conversation

```typescript
import { conversationalAiApi } from '@/lib/conversational-ai-api';

const response = await conversationalAiApi.startConversation(roleId);
console.log(response.next_question); // Display to user
```

### Send Message

```typescript
const response = await conversationalAiApi.sendMessage(
  roleId,
  "Senior Software Engineer"
);
console.log(response.next_question); // Next AI question
```

### Get Roadmap

```typescript
import { mapRoleToRoadmap } from '@/lib/mappers/role-enhancement-mapper';

const response = await conversationalAiApi.getConversation(roleId);
const roadmap = mapRoleToRoadmap(response.role);
// Use roadmap in Roadmap component
```

### Error Handling

```typescript
import { ConversationalApiError } from '@/lib/conversational-ai-api';

try {
  const response = await conversationalAiApi.sendMessage(roleId, message);
} catch (error) {
  if (error instanceof ConversationalApiError) {
    console.error(`API Error (${error.status}):`, error.message);
    if (error.status === 422) {
      // Handle validation error
      console.error('Validation details:', error.details);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Page loads and initializes conversation
- [ ] Roadmap displays correct sections
- [ ] Loading states show properly
- [ ] Error states display with retry option
- [ ] Next question appears on page
- [ ] Pause button is functional (shows mock success)
- [ ] Network errors are handled gracefully
- [ ] Validation errors display properly

### Testing with Backend

1. Start backend server: `http://localhost:8000`
2. Ensure role exists with ID: `gSMy88JCwIFlQlzgbs4c`
3. Start frontend: `npm run dev`
4. Navigate to: `http://localhost:3000/conversational-ai`
5. Verify conversation initializes
6. Check browser console for API calls
7. Verify roadmap updates

## Future Enhancements

1. **Voice Integration**
   - Connect VoiceAgentWidget to API
   - Implement speech-to-text
   - Add text-to-speech for AI responses

2. **Real-time Updates**
   - WebSocket integration
   - Live message streaming
   - Real-time roadmap updates

3. **Session Persistence**
   - Store conversation ID in localStorage
   - Resume conversations across page refreshes
   - Handle session expiration

4. **Enhanced Error Handling**
   - Toast notifications
   - Error boundary component
   - Retry with exponential backoff

5. **Dynamic Role ID**
   - Accept from URL parameters
   - Integrate with role selection flow
   - Support multiple concurrent conversations

## Troubleshooting

### Issue: "Failed to initialize conversation"

**Possible causes:**
- Backend server not running
- Incorrect API base URL
- Role ID doesn't exist
- Network connectivity issues

**Solutions:**
1. Check backend server is running: `curl http://localhost:8000/health`
2. Verify `.env.local` has correct API URL
3. Check browser console for detailed error
4. Verify role exists in database

### Issue: "No role ID provided"

**Cause:** Role ID is not set or is undefined

**Solution:** Update `DEFAULT_ROLE_ID` in `page.tsx` with valid role ID

### Issue: Roadmap not updating

**Possible causes:**
- API not returning updated data
- Mapper not transforming correctly
- Component not re-rendering

**Solutions:**
1. Check API response in network tab
2. Add console.log in mapper functions
3. Verify component dependencies in useEffect

## Support

For issues or questions:
1. Check browser console for errors
2. Review API response in network tab
3. Verify environment configuration
4. Check backend logs for API errors

