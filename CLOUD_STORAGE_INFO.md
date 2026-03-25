# SubManager - Cloud Storage Implementation

## Overview
SubManager now uses **Supabase** as the cloud backend for storing all user data. This ensures that:
- Each user has their own isolated account
- All data is stored securely in the cloud
- Data syncs automatically across all devices
- No more localStorage - everything is in the cloud

## Architecture

### Backend (Supabase Edge Functions)
Located in `/supabase/functions/server/index.tsx`

The server handles:
1. **User Authentication** - Signup and login via Supabase Auth
2. **Subscriptions Management** - CRUD operations for user subscriptions
3. **Settings Storage** - User preferences (language, currency, theme, font size)

### Data Storage Structure

All data is stored in the KV store with user-specific prefixes:

- `subscriptions:{userId}:{subscriptionId}` - Individual subscription data
- `settings:{userId}` - User settings object

### API Endpoints

All endpoints are prefixed with `/make-server-076c1030`:

1. **POST /signup**
   - Creates new user account
   - Initializes default settings
   - Auto-confirms email (no email server required)

2. **GET /subscriptions**
   - Returns all subscriptions for authenticated user
   - Requires: `Authorization: Bearer {access_token}`

3. **POST /subscriptions**
   - Creates new subscription for user
   - Requires: `Authorization: Bearer {access_token}`

4. **PUT /subscriptions/:id**
   - Updates existing subscription
   - Requires: `Authorization: Bearer {access_token}`
   - Only allows updating user's own subscriptions

5. **DELETE /subscriptions/:id**
   - Deletes subscription
   - Requires: `Authorization: Bearer {access_token}`
   - Only allows deleting user's own subscriptions

6. **GET /settings**
   - Returns user settings
   - Returns default settings if none exist
   - Requires: `Authorization: Bearer {access_token}`

7. **PUT /settings**
   - Updates user settings
   - Requires: `Authorization: Bearer {access_token}`

## Security Features

### Data Isolation
- Each user's data is prefixed with their unique `userId`
- Server validates `access_token` on every request
- Users can only access their own data

### Authentication Flow
1. User signs up via `/signup` endpoint
2. Server creates user in Supabase Auth
3. Server initializes default settings for new user
4. User signs in and receives `access_token`
5. Frontend stores token and uses it for all API calls
6. Server validates token and extracts `userId` for data access

### Default Settings
New users automatically get:
```javascript
{
  language: 'ru',
  currency: 'RUB',
  fontSize: 'medium',
  theme: 'dark'
}
```

## Frontend Integration

### AppContext
- Manages authentication state
- Loads user data on login
- Provides functions for data operations
- All operations go through API (no localStorage)

### Data Flow
1. User logs in → Receives `access_token`
2. AppContext loads subscriptions and settings from API
3. User makes changes → Immediately saved to cloud via API
4. Settings changes apply to UI instantly
5. Data persists across sessions and devices

## Migration from localStorage

### What Changed
- ❌ Removed: Test accounts system
- ❌ Removed: localStorage for subscriptions
- ❌ Removed: localStorage for settings
- ❌ Removed: sessionStorage for test users
- ✅ Added: Full Supabase authentication
- ✅ Added: Cloud-based data storage
- ✅ Added: Automatic data synchronization
- ✅ Added: User isolation and security

### Benefits
1. **Multi-device sync** - Access your data from any device
2. **Data persistence** - Never lose your data
3. **Security** - Each user's data is isolated and protected
4. **Scalability** - Cloud infrastructure handles growth
5. **Backup** - Data is automatically backed up by Supabase

## User Experience

### First-time Users
1. Sign up with email/password
2. See welcome message with instructions
3. Default settings applied automatically
4. Start adding subscriptions

### Returning Users
1. Sign in with credentials
2. All data loads automatically
3. UI reflects saved settings (theme, language, etc.)
4. All subscriptions are available

### Settings Changes
- Changes save immediately to cloud
- No manual save button needed
- Settings persist across sessions
- Settings sync across devices

## Error Handling

All API calls include:
- Detailed error logging
- User-friendly error messages
- Automatic retry for network errors
- Graceful degradation

## Notes for Developers

- All server code is in `/supabase/functions/server/`
- Frontend API client is in `/src/app/utils/api.ts`
- Authentication logic is in `/src/app/contexts/AppContext.tsx`
- Server uses Deno runtime with npm imports

## Future Enhancements

Potential improvements:
- Email verification flow
- Password reset functionality
- Social login (Google, GitHub, etc.)
- Profile management
- Data export functionality
- Subscription import from email
