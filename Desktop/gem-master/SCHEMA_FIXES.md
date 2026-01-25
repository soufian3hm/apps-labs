# Database Schema Fixes

This document outlines the schema mismatches that were fixed in the admin setup.

## Issues Fixed

### 1. LeadFormField Interface Mismatch
**Problem**: TypeScript interface used `config_id` but database uses `lead_form_config_id`

**Fixed in**: `src/types/supabase.ts`

**Changes**:
```typescript
// Before:
export interface LeadFormField {
    id: string;
    config_id: string;  // ❌ Wrong column name
    field_type: string;
    label: string;
    placeholder?: string;
    is_required: boolean;
    options?: any;
    sort_order: number;
    created_at: string;
}

// After:
export interface LeadFormField {
    id: string;
    lead_form_config_id: string;  // ✅ Correct column name
    field_type: string;
    label: string;
    placeholder?: string;
    required: boolean;  // ✅ Matches database column name
    validation_pattern?: string;  // ✅ Added missing field
    options?: any;
    sort_order: number;
    created_at: string;
}
```

### 2. LeadSubmission Interface Mismatch
**Problem**: TypeScript interface had fields that don't exist in database

**Fixed in**: `src/types/supabase.ts`

**Changes**:
```typescript
// Before:
export interface LeadSubmission {
    id: string;
    product_id: string;
    form_data: Record<string, any>;
    status: 'new' | 'contacted' | 'converted' | 'closed';  // ❌ Not in database
    notes?: string;  // ❌ Not in database
    submitted_at: string;
    updated_at: string;  // ❌ Not in database
}

// After:
export interface LeadSubmission {
    id: string;
    product_id: string;
    form_data: Record<string, any>;
    synced_to_sheet: boolean;  // ✅ From database
    ip_address?: string;  // ✅ From database
    user_agent?: string;  // ✅ From database
    submitted_at: string;
}
```

### 3. Lead Form Fields SQL Policies
**Problem**: SQL policies referenced `config_id` instead of `lead_form_config_id`

**Fixed in**: `ADMIN_SETUP.sql`

**Changes**:
```sql
-- Before:
WHERE lead_form_configs.id = lead_form_fields.config_id

-- After:
WHERE lead_form_configs.id = lead_form_fields.lead_form_config_id
```

### 4. Lead IP Tracking SQL Policies
**Problem**: SQL policies referenced non-existent `submission_id` column

**Fixed in**: `ADMIN_SETUP.sql`

**Changes**:
```sql
-- Before (incorrect):
WHERE lead_submissions.id = lead_ip_tracking.submission_id

-- After (correct):
WHERE stores.id = lead_ip_tracking.store_id
```

## Database Schema Reference

### lead_form_fields Table
```sql
CREATE TABLE lead_form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_form_config_id UUID NOT NULL,  -- Foreign key to lead_form_configs
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    field_type TEXT DEFAULT 'text' NOT NULL,
    required BOOLEAN DEFAULT true NOT NULL,
    validation_pattern TEXT,
    options TEXT[],
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### lead_submissions Table
```sql
CREATE TABLE lead_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    form_data JSONB DEFAULT '{}' NOT NULL,
    synced_to_sheet BOOLEAN DEFAULT false NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);
```

### lead_ip_tracking Table
```sql
CREATE TABLE lead_ip_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    ip_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Verification

After applying these fixes:

1. ✅ All TypeScript interfaces match database schema
2. ✅ All SQL policies reference correct column names
3. ✅ Admin setup SQL should execute without errors
4. ✅ Type safety is maintained throughout the application

## Next Steps

1. Run the fixed `ADMIN_SETUP.sql` in Supabase
2. Test the admin dashboard functionality
3. Verify all RLS policies work correctly
4. Check that the admin button appears for admin users
