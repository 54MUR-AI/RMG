# Admin Account Setup Guide

## Overview
This guide explains how to set up the admin account for the RMG platform with full command and control features, especially forum moderation tools.

## Admin Account
**Email**: `roninmediacollective@proton.me`  
**GitHub**: `54MUR-AI`

## Database Setup

### 1. Run the Admin Schema Migration
Execute the SQL file in your Supabase SQL Editor:
```bash
# File: supabase-admin-schema.sql
```

This creates:
- `user_roles` table with admin/moderator flags
- Helper functions: `is_admin()`, `is_moderator()`
- Updated RLS policies for admin access
- Automatic admin assignment for roninmediacollective@proton.me

### 2. Verify Admin Account
After the admin account signs in for the first time, verify the role:

```sql
SELECT * FROM user_roles WHERE email = 'roninmediacollective@proton.me';
```

Should show:
- `is_admin: true`
- `is_moderator: true`

### 3. Manual Admin Assignment (if needed)
If the trigger didn't work, manually set admin:

```sql
INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
SELECT id, email, true, true 
FROM auth.users 
WHERE email = 'roninmediacollective@proton.me'
ON CONFLICT (user_id) 
DO UPDATE SET is_admin = true, is_moderator = true;
```

## Admin Features

### Forum Moderation
Admins can:
- ✅ **Pin/Unpin threads** - Keep important threads at the top
- ✅ **Lock/Unlock threads** - Prevent new replies
- ✅ **Delete any thread** - Remove inappropriate content
- ✅ **Delete any post** - Remove individual replies
- ✅ **Manage categories** - Create, edit, delete forum categories
- ✅ **View all users** - See user list with roles
- ✅ **Assign moderators** - Grant moderator permissions to users

### Admin UI Components
Admin controls appear when logged in as admin:
- Thread cards show Pin/Lock/Delete buttons
- Post cards show Delete button
- Admin panel accessible from navbar (when implemented)

## Code Integration

### 1. Add AdminProvider to App
```tsx
import { AdminProvider } from './contexts/AdminContext'

<AuthProvider>
  <AdminProvider>
    {/* Your app */}
  </AdminProvider>
</AuthProvider>
```

### 2. Use Admin Hook in Components
```tsx
import { useAdmin } from '../contexts/AdminContext'

function MyComponent() {
  const { isAdmin, isModerator } = useAdmin()
  
  return (
    <>
      {isAdmin && <AdminControls />}
      {isModerator && <ModeratorControls />}
    </>
  )
}
```

### 3. Admin Functions
```tsx
import { 
  toggleThreadPin, 
  toggleThreadLock, 
  deleteThread,
  deletePost,
  upsertCategory,
  deleteCategory,
  getAllUsers,
  updateUserRole
} from '../lib/admin'

// Example: Pin a thread
await toggleThreadPin(threadId, true)

// Example: Delete a post
await deletePost(postId)

// Example: Make user a moderator
await updateUserRole(userId, { is_moderator: true })
```

## Security

### Row Level Security (RLS)
- All admin functions check `is_admin()` in RLS policies
- Non-admins cannot bypass security even with direct API calls
- Admin functions use `SECURITY DEFINER` for safe privilege escalation

### Best Practices
1. **Never hardcode admin checks in frontend** - Always use RLS
2. **Validate on server** - RLS policies are the source of truth
3. **Audit admin actions** - Consider adding admin_logs table
4. **Limit admin accounts** - Only trusted users should be admins

## Testing

### Test Admin Access
1. Sign in with `roninmediacollective@proton.me`
2. Navigate to Forum
3. Verify admin controls appear on threads/posts
4. Test pin, lock, delete functions

### Test Non-Admin
1. Sign in with regular account
2. Verify admin controls are hidden
3. Attempt direct API calls (should fail with RLS)

## Future Enhancements

### Planned Features
- [ ] Admin dashboard page
- [ ] User management panel
- [ ] Audit log for admin actions
- [ ] Ban/suspend user functionality
- [ ] Content moderation queue
- [ ] Analytics and reporting
- [ ] Bulk actions (delete multiple posts)
- [ ] Custom moderator permissions

### Database Extensions
```sql
-- Future: Admin action logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Future: User bans
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  banned_by UUID REFERENCES auth.users(id),
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### Admin not working after sign-in
1. Check if user_roles entry exists
2. Verify is_admin is true
3. Check RLS policies are enabled
4. Refresh the page to reload admin context

### RLS errors
1. Ensure functions are created with SECURITY DEFINER
2. Verify policies reference is_admin() function
3. Check Supabase logs for detailed errors

### Admin UI not showing
1. Verify AdminProvider wraps your app
2. Check useAdmin() hook is called correctly
3. Ensure admin context is not loading (check loading state)

## Support
For issues with admin setup, contact the development team or check the RMG GitHub repository.
