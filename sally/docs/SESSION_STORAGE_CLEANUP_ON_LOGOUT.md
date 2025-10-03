# Session Storage Cleanup on Logout

## 🎯 Overview

Added functionality to **clear `current_role_id` from session storage on user logout**. This ensures that when a user signs out, their current role session is cleared and they start fresh on the next login.

Additionally, **TODO comments** have been added throughout the codebase to guide future implementation when the job list feature is added.

---

## ✅ What Was Implemented

### **1. Clear Role ID on Logout**
- Delete `current_role_id` from session storage when user logs out
- Prevents role ID from persisting after logout
- Clean slate for next login

### **2. TODO Comments Added**
- Added comprehensive TODO comments for future job list feature
- Guidance on how to handle multiple roles
- Notes on persistence strategy
- Instructions for role management

---

## 🔧 Implementation Details

### **Logout Function Update**

**File**: `sally/src/contexts/AuthContext.tsx`

**Code**:
```typescript
const logout = () => {
  AuthService.logout();
  
  // Clear current role ID from session storage
  // TODO: When job list is implemented, this should be updated to:
  // 1. Keep role IDs in session storage for "Continue where you left off" feature
  // 2. Only clear role IDs when user explicitly deletes them from job list
  // 3. Consider moving role IDs to a more persistent storage (localStorage or backend)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('current_role_id');
  }
  
  setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  
  // Navigate to landing page after logout
  router.push('/landing-page');
};
```

**What it does**:
1. Calls `AuthService.logout()` to clear auth tokens
2. Removes `current_role_id` from session storage
3. Clears user state
4. Redirects to landing page

---

## 📝 TODO Comments Added

### **1. In AuthContext (Logout)**

**Location**: `sally/src/contexts/AuthContext.tsx` - Line 79-83

**TODO**:
```typescript
// TODO: When job list is implemented, this should be updated to:
// 1. Keep role IDs in session storage for "Continue where you left off" feature
// 2. Only clear role IDs when user explicitly deletes them from job list
// 3. Consider moving role IDs to a more persistent storage (localStorage or backend)
```

**Guidance**:
- Don't clear role IDs on logout (keep for next session)
- Only clear when user explicitly deletes
- Consider localStorage for persistence
- Consider backend storage for cross-device access

---

### **2. In Conversational AI Page (Load Role)**

**Location**: `sally/src/app/conversational-ai/page.tsx` - Line 72-76

**TODO**:
```typescript
// TODO: When job list is implemented, update this to:
// 1. Show a job list/selection page instead of redirecting to job-description
// 2. Allow user to select from existing roles or create a new one
// 3. Add "Continue where you left off" feature with last accessed role
// 4. Consider using URL params for role ID (e.g., /conversational-ai?roleId=xxx)
```

**Guidance**:
- Show job list instead of redirecting
- Let user choose from existing roles
- Implement "Continue where you left off"
- Use URL params for deep linking

**Additional TODO** (Line 79):
```typescript
// TODO: When job list exists, redirect to job list instead of job-description
```

---

### **3. In Job Description Actions (Create Role - Build)**

**Location**: `sally/src/components/job-description-actions.tsx` - Line 64-68

**TODO**:
```typescript
// TODO: When job list is implemented:
// 1. Add this role to the user's job list
// 2. Consider using localStorage for persistence across sessions
// 3. Add role metadata (created_at, last_accessed, status)
// 4. Implement role management (edit, delete, duplicate)
```

**Guidance**:
- Add role to job list
- Use localStorage for persistence
- Track metadata (created_at, last_accessed, status)
- Implement CRUD operations

---

### **4. In Job Description Actions (Create Role - Upload)**

**Location**: `sally/src/components/job-description-actions.tsx` - Line 30-34

**TODO**:
```typescript
// TODO: When job list is implemented:
// 1. Add this role to the user's job list
// 2. Consider using localStorage for persistence across sessions
// 3. Add role metadata (created_at, last_accessed, status)
// 4. Implement role management (edit, delete, duplicate)
```

**Guidance**: Same as above

---

## 🔄 Current Behavior

### **User Flow**

```
1. User logs in
   ↓
2. User creates a role (Build or Upload)
   ↓
3. Role ID saved to session storage
   ↓
4. User works on conversational AI
   ↓
5. User logs out
   ↓
6. Role ID cleared from session storage ✅
   ↓
7. User logs in again
   ↓
8. No role ID found
   ↓
9. Redirected to job description page
   ↓
10. User creates new role (starts fresh)
```

---

## 🔮 Future Behavior (With Job List)

### **Proposed User Flow**

```
1. User logs in
   ↓
2. User creates multiple roles over time
   ↓
3. All roles saved to job list (localStorage or backend)
   ↓
4. User works on various roles
   ↓
5. User logs out
   ↓
6. Role IDs KEPT in storage ✅ (for next session)
   ↓
7. User logs in again
   ↓
8. Redirected to job list page
   ↓
9. User sees all their roles:
   - "Senior Engineer" (last accessed: 2 hours ago)
   - "Product Manager" (last accessed: yesterday)
   - "Data Scientist" (last accessed: 3 days ago)
   ↓
10. User can:
    - Continue where they left off (last role)
    - Select any existing role
    - Create a new role
    - Delete old roles
    - Duplicate roles
```

---

## 📋 Job List Feature Requirements

### **When Implementing Job List**

**1. Storage Strategy**:
- Use `localStorage` instead of `sessionStorage` for persistence
- Or store role list in backend database
- Keep role metadata (created_at, last_accessed, status)

**2. Job List Page**:
- Create `/job-list` or `/my-roles` page
- Show all user's roles in a list/grid
- Display role metadata (title, status, last accessed)
- Add search/filter functionality

**3. Role Management**:
- **View**: Click to open role in conversational AI
- **Edit**: Modify role details
- **Delete**: Remove role from list
- **Duplicate**: Create copy of existing role
- **Archive**: Hide completed roles

**4. Continue Where You Left Off**:
- Track `last_accessed` timestamp for each role
- Show most recent role at top
- Add "Continue" button for last role
- Auto-redirect to last role (optional)

**5. URL Structure**:
- `/conversational-ai?roleId=abc123` - Open specific role
- `/job-list` - View all roles
- `/job-description` - Create new role

**6. Update Logout Behavior**:
- Don't clear role IDs on logout
- Keep role list in localStorage
- Only clear when user explicitly deletes

---

## 🧪 Testing

### **Test Logout Cleanup**

**Steps**:
1. Log in to the application
2. Create a role (Build or Upload)
3. Verify role ID in session storage:
   ```javascript
   sessionStorage.getItem('current_role_id')
   // Should return: "abc123..."
   ```
4. Log out
5. Check session storage again:
   ```javascript
   sessionStorage.getItem('current_role_id')
   // Should return: null ✅
   ```
6. Log in again
7. Navigate to `/conversational-ai`
8. Should be redirected to `/job-description` ✅

### **Verify TODO Comments**

**Check files**:
- [ ] `sally/src/contexts/AuthContext.tsx` - Logout function
- [ ] `sally/src/app/conversational-ai/page.tsx` - Load role effect
- [ ] `sally/src/components/job-description-actions.tsx` - Build handler
- [ ] `sally/src/components/job-description-actions.tsx` - Upload handler

**Verify each TODO**:
- [ ] Clear and actionable
- [ ] Provides specific guidance
- [ ] Mentions job list feature
- [ ] Suggests implementation approach

---

## 📁 Files Modified

### **1. `sally/src/contexts/AuthContext.tsx`**
- ✅ Added `sessionStorage.removeItem('current_role_id')` in logout
- ✅ Added TODO comment for future job list behavior
- ✅ Added browser check (`typeof window !== 'undefined'`)

### **2. `sally/src/app/conversational-ai/page.tsx`**
- ✅ Added TODO comment for job list page
- ✅ Added TODO comment for URL params
- ✅ Added TODO comment for redirect behavior

### **3. `sally/src/components/job-description-actions.tsx`**
- ✅ Added TODO comments in `handleBuildClick()`
- ✅ Added TODO comments in `handleFileUpload()`
- ✅ Guidance for role management features

### **4. `sally/docs/SESSION_STORAGE_CLEANUP_ON_LOGOUT.md`**
- ✅ This documentation file

---

## 🔍 Code Locations

### **Session Storage Cleanup**
```typescript
// File: sally/src/contexts/AuthContext.tsx
// Line: ~84
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('current_role_id');
}
```

### **TODO Comments**
```typescript
// File: sally/src/contexts/AuthContext.tsx
// Line: ~79-83
// TODO: When job list is implemented...

// File: sally/src/app/conversational-ai/page.tsx
// Line: ~72-76
// TODO: When job list is implemented, update this to...

// File: sally/src/components/job-description-actions.tsx
// Line: ~30-34, ~64-68
// TODO: When job list is implemented...
```

---

## ✅ Summary

Successfully implemented session storage cleanup on logout and added comprehensive TODO comments for future job list feature:

**Implemented**:
- ✅ Clear `current_role_id` on logout
- ✅ Browser check for session storage
- ✅ Clean user state on logout

**TODO Comments Added**:
- ✅ Logout behavior guidance
- ✅ Job list page guidance
- ✅ Role management guidance
- ✅ Persistence strategy guidance
- ✅ URL structure guidance

**Benefits**:
- 🔒 Clean logout (no stale data)
- 📝 Clear guidance for future developers
- 🎯 Roadmap for job list feature
- 🛠️ Easier to implement job list later

**Status**: ✅ **COMPLETE**

The system now properly cleans up session storage on logout, and future developers have clear guidance on how to implement the job list feature!

