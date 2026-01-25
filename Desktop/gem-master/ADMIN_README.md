# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard with role-based access control.

## Overview

The admin dashboard provides system-wide access to:
- View all users, stores, products, and leads
- Manage user roles (promote/demote admins)
- Monitor platform statistics and activity
- Access comprehensive analytics

## Setup Instructions

### 1. Run the SQL Setup

Execute the `ADMIN_SETUP.sql` file in your Supabase SQL Editor:

1. Open your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of `ADMIN_SETUP.sql`
4. Execute the script

This will:
- Add a `role` column to the `profiles` table
- Create the `is_admin()` helper function
- Set up RLS policies for all tables with admin access
- Create the `admin_stats` view for dashboard statistics
- Add functions to promote/demote users

### 2. Create Your First Admin User

After running the SQL setup, make yourself an admin by running this SQL command:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

### 3. Verify Setup

1. Log in to your GEM account
2. Navigate to the dashboard
3. Click on your avatar in the top-right corner
4. You should see an "Admin Dashboard" option in the dropdown menu
5. Click it to access the admin dashboard at `/admin`

## Features

### Admin Route Protection

The admin routes are protected by the proxy middleware:
- Users must be authenticated
- Users must have `role = 'admin'` in their profile
- Non-admin users are redirected to the regular dashboard

### Admin Dashboard Features

**Statistics Overview:**
- Total users and admins
- Total stores and products
- Lead submissions (total, today, this week, this month)

**Quick Actions:**
- Manage Users
- Manage Stores
- Manage Products
- View Leads

### RLS Policies

All tables now have comprehensive RLS policies:

**For Regular Users:**
- Can only view/manage their own data
- Can view published products (public)
- Can submit leads to published products

**For Admin Users:**
- Full read/write access to all tables
- Can view all users, stores, products, and leads
- Can manage themes and system settings

## Admin Functions

### Promote User to Admin

```sql
SELECT promote_to_admin('user@example.com');
```

### Demote Admin to User

```sql
SELECT demote_to_user('user@example.com');
```

## Security Considerations

1. **Role Column**: The role column has a CHECK constraint to only allow 'user' or 'admin' values
2. **Self-Protection**: Regular users cannot modify their own role through the UI
3. **RLS Enforcement**: All policies are enforced at the database level
4. **Proxy Protection**: The proxy middleware provides an additional layer of security

## Database Schema Changes

### Profiles Table
```sql
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
```

### Admin Stats View
```sql
CREATE VIEW admin_stats AS ...
```

This view provides aggregated statistics for the admin dashboard.

## Accessing the Admin Dashboard

**URL:** `/admin`

**Requirements:**
- Must be logged in to GEM
- Must have `role = 'admin'` in the profiles table

**Navigation:**
1. Log in to your account
2. Go to the dashboard
3. Click your avatar (top-right)
4. Select "Admin Dashboard"

## Future Enhancements

The admin dashboard is designed to be extensible. Planned features include:

- User management interface
- Store management and moderation
- Product approval workflow
- Lead analytics and reporting
- System configuration
- Activity logs and audit trails

## Troubleshooting

### "Admin Dashboard" button not showing
- Verify your role: `SELECT role FROM profiles WHERE email = 'your-email@example.com';`
- Ensure you're logged in
- Clear browser cache and refresh

### Access denied to admin dashboard
- Check that the SQL setup was executed successfully
- Verify RLS policies are enabled
- Ensure the `is_admin()` function exists

### Stats not loading
- Verify the `admin_stats` view was created
- Check RLS policies on the view
- Look for errors in the browser console

## Support

For issues or questions about the admin dashboard, please check:
1. Supabase logs for database errors
2. Browser console for frontend errors
3. Network tab for API request failures
