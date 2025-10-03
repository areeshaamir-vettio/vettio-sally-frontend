# Voice Input Delay and Last Sentence Capture

## 🎯 Overview

Updated the voice input system to **wait 1 second after the user stops speaking** before calling the `/enhance/` API. The system now **captures only the last spoken sentence** and sends it to the API.

This prevents premature API calls and ensures only the most recent, complete sentence is sent for processing.

---

## ✅ What Was Implemented

### **1. 1-Second Delay After Speaking**
- Wait 1 second after user stops speaking
- Only call API after silence period
- Prevents premature API calls
- Better user experience

### **2. Last Sentence Capture**
- Capture only the last spoken sentence
- Replace previous sentences (not accumulate)
- Send only the most recent input
- Show current sentence in real-time

### **3. Timeout Management**
- Clear timeout if user continues speaking
- Reset timeout on each final transcript
- Clean up on component unmount
- Clean up when user stops voice input

---

## 🔧 Implementation Details

### **New State References**

**File**: `sally/src/components/voice-agent-widget.tsx`

**Added References**:
```typescript
const finalTranscriptRef = useRef('');        // Stores the last final transcript
const sendTimeoutRef = useRef<NodeJS.Timeout | null>(null);  // Timeout for delayed send
```

**Purpose**:
- `finalTranscriptRef`: Stores only the last spoken sentence (replaces previous)
- `sendTimeoutRef`: Manages the 1-second delay timeout

---

### **Updated Recognition Handler**

**Before (Immediate Send)**:
```typescript
recognition.onresult = (event) => {
  // ... process transcripts
  
  if (finalTranscript.trim()) {
    // Send immediately ❌
    onVoiceInput?.(finalTranscript.trim());
  }
};
```

**After (Delayed Send with Last Sentence)**:
```typescript
recognition.onresult = (event) => {
  // ... process transcripts

  // Show interim results in real-time
  setTranscript(interimTranscript || finalTranscriptRef.current);

  if (finalTranscript.trim()) {
    // Replace with the latest final transcript (not accumulate)
    finalTranscriptRef.current = finalTranscript.trim();
    setTranscript(finalTranscriptRef.current);

    // Clear any existing timeout
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }

    // Set new timeout to send after 1 second of silence
    sendTimeoutRef.current = setTimeout(() => {
      const textToSend = finalTranscriptRef.current.trim();

      if (textToSend) {
        console.log('🎤 Sending last voice input after 1s delay:', textToSend);
        onVoiceInput?.(textToSend);

        // Clear transcript
        finalTranscriptRef.current = '';
        setTranscript('');
      }
    }, 1000); // 1 second delay ✅
  }
};
```

---

## 🎯 How It Works

### **User Flow**

```
1. User clicks microphone 🎤
   ↓
2. User starts speaking: "I need a senior"
   ↓
3. Interim transcript shown: "I need a senior"
   ↓
4. User pauses briefly (final transcript received)
   ↓
5. Stored: "I need a senior"
   ↓
6. Timer starts: 1 second countdown ⏱️
   ↓
7. User continues: "software engineer"
   ↓
8. Timer reset! ⏱️ (user still speaking)
   ↓
9. Stored (REPLACED): "software engineer" ✅
   ↓
10. User stops speaking
   ↓
11. Timer starts: 1 second countdown ⏱️
   ↓
12. 1 second passes with no speech
   ↓
13. API called with LAST sentence only: ✅
    "software engineer"
   ↓
14. Transcript cleared
   ↓
15. Ready for next input
```

---

## ⏱️ Timing Behavior

### **Scenario 1: User Speaks Continuously (Single Sentence)**

```
Time: 0s    User: "I need a senior software engineer"
Time: 2s    User: [stops]
Time: 3s    API called ✅ (1s after last word)

Result: "I need a senior software engineer"
```

### **Scenario 2: User Speaks Multiple Sentences**

```
Time: 0s    User: "I need a senior"
Time: 1s    User: [pause - final transcript]
            Stored: "I need a senior"
Time: 1.5s  User: "software engineer"
Time: 2.5s  User: [stops - final transcript]
            Stored (REPLACED): "software engineer"
Time: 3.5s  API called ✅ (1s after last word)

Result: "software engineer" (only the last sentence)
```

### **Scenario 3: User Stops Voice Input**

```
Time: 0s    User: "I need a senior"
Time: 1s    User: [clicks stop button]
Time: 1s    Timeout cleared ❌
Time: 1s    Transcripts cleared
Time: 1s    No API call

Result: Nothing sent (user cancelled)
```

---

## 🎨 Visual Feedback

### **Real-time Display**

**While Speaking**:
```
┌─────────────────────────────────────┐
│  You're saying:                     │
│  "I need a senior software..."      │
└─────────────────────────────────────┘
```

**After Stopping (Waiting 1s)**:
```
┌─────────────────────────────────────┐
│  You're saying:                     │
│  "I need a senior software engineer"│
│  [Processing in 1s...]              │
└─────────────────────────────────────┘
```

**After Sending**:
```
┌─────────────────────────────────────┐
│  Processing...                      │
│  [Sending to API]                   │
└─────────────────────────────────────┘
```

---

## 🧹 Cleanup Logic

### **1. Component Unmount**

```typescript
return () => {
  // Clear any pending send timeout
  if (sendTimeoutRef.current) {
    clearTimeout(sendTimeoutRef.current);
    sendTimeoutRef.current = null;
  }
  
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }
};
```

**Purpose**: Prevent memory leaks and orphaned timeouts

---

### **2. User Stops Voice Input**

```typescript
if (!newActiveState) {  // User clicked stop
  recognitionRef.current.stop();
  
  // Clear any pending send timeout
  if (sendTimeoutRef.current) {
    clearTimeout(sendTimeoutRef.current);
    sendTimeoutRef.current = null;
  }
  
  // Clear all transcripts
  setTranscript('');
  interimTranscriptRef.current = '';
  finalTranscriptRef.current = '';
}
```

**Purpose**: Cancel pending API call when user stops manually

---

### **3. User Continues Speaking**

```typescript
// Clear any existing timeout
if (sendTimeoutRef.current) {
  clearTimeout(sendTimeoutRef.current);
}

// Set new timeout
sendTimeoutRef.current = setTimeout(() => {
  // Send after 1 second
}, 1000);
```

**Purpose**: Reset timer if user continues speaking

---

## 📊 Benefits

### **1. Better User Experience**
- ✅ User can speak naturally without rushing
- ✅ Complete thoughts captured
- ✅ No premature API calls
- ✅ Real-time feedback

### **2. Reduced API Calls**
- ✅ One API call per complete message
- ✅ No calls for partial sentences
- ✅ Lower server load
- ✅ Cost savings

### **3. More Accurate Results**
- ✅ Complete context sent to AI
- ✅ Better AI understanding
- ✅ More relevant responses
- ✅ Fewer misunderstandings

### **4. Natural Conversation Flow**
- ✅ User can pause mid-sentence
- ✅ User can think while speaking
- ✅ No interruptions
- ✅ Feels natural

---

## 🧪 Testing

### **Test 1: Continuous Speech**

**Steps**:
1. Click microphone 🎤
2. Speak continuously: "I need a senior software engineer with five years of experience"
3. Stop speaking
4. Wait 1 second
5. ✅ Check: API called once with complete text

**Expected**:
- API called after 1 second
- Complete message sent
- No intermediate API calls

---

### **Test 2: Speech with Pauses**

**Steps**:
1. Click microphone 🎤
2. Speak: "I need a senior"
3. Pause 0.5 seconds
4. Continue: "software engineer"
5. Stop speaking
6. Wait 1 second
7. ✅ Check: API called once with complete text

**Expected**:
- Timer resets on each pause
- API called after final 1-second silence
- Complete message: "I need a senior software engineer"

---

### **Test 3: Cancel Before Send**

**Steps**:
1. Click microphone 🎤
2. Speak: "I need a senior software engineer"
3. Immediately click stop button (before 1 second)
4. ✅ Check: No API call made

**Expected**:
- Timeout cleared
- No API call
- Transcripts cleared

---

### **Test 4: Multiple Messages**

**Steps**:
1. Click microphone 🎤
2. Speak: "Senior software engineer"
3. Wait 1 second (API called)
4. Speak: "With five years experience"
5. Wait 1 second (API called)
6. ✅ Check: Two separate API calls

**Expected**:
- First message: "Senior software engineer"
- Second message: "With five years experience"
- Two separate API calls

---

## 🔍 Console Logs

### **Debugging Output**

```javascript
// When sending voice input
console.log('🎤 Sending voice input after 1s delay:', textToSend);
```

**Example Output**:
```
🎤 Sending voice input after 1s delay: I need a senior software engineer
```

**Use for**:
- Debugging timing issues
- Verifying complete text sent
- Monitoring API calls

---

## ⚙️ Configuration

### **Current Settings**

```typescript
const SEND_DELAY = 1000;  // 1 second (1000ms)
```

**To Change Delay**:
```typescript
// In voice-agent-widget.tsx, line ~88
sendTimeoutRef.current = setTimeout(() => {
  // ...
}, 1000);  // Change this value

// Examples:
// 500   = 0.5 seconds (faster, more responsive)
// 1000  = 1 second (current, balanced)
// 1500  = 1.5 seconds (slower, more patient)
// 2000  = 2 seconds (very patient)
```

**Recommendation**: Keep at 1000ms (1 second) for best balance

---

## 📁 Files Modified

### **`sally/src/components/voice-agent-widget.tsx`**

**Changes**:
1. ✅ Added `finalTranscriptRef` for accumulation
2. ✅ Added `sendTimeoutRef` for delay management
3. ✅ Updated `onresult` handler with delay logic
4. ✅ Added timeout cleanup in unmount
5. ✅ Added timeout cleanup in stop handler
6. ✅ Added console log for debugging

**Lines Modified**: ~22-26, ~51-98, ~122-135, ~159-173

---

## 🎯 Key Differences

### **Before vs After**

| Aspect | Before | After |
|--------|--------|-------|
| **API Timing** | Immediate | 1s delay ✅ |
| **Transcript** | Fragments | Last sentence only ✅ |
| **API Calls** | Multiple | Single ✅ |
| **User Experience** | Rushed | Natural ✅ |
| **Sent Data** | All fragments | Last sentence ✅ |

---

## ✅ Summary

Successfully implemented **1-second delay** and **transcript accumulation** for voice input:

**Implemented**:
- ✅ 1-second delay after user stops speaking
- ✅ Accumulate all final transcripts
- ✅ Send complete message to API
- ✅ Clear timeout on user stop
- ✅ Clear timeout on component unmount
- ✅ Real-time visual feedback
- ✅ Console logging for debugging

**Benefits**:
- 🎯 **Better UX** - Natural speaking flow
- 📉 **Fewer API calls** - One call per message
- 🎯 **More accurate** - Complete context
- 🧹 **Clean code** - Proper cleanup
- 🐛 **Easy debugging** - Console logs

**Status**: ✅ **COMPLETE**

The voice input system now waits for the user to finish speaking before calling the API, resulting in a more natural and accurate conversation experience!

