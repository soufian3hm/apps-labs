-- =====================================================
-- ADMIN USER MANAGEMENT SETUP
-- =====================================================

-- 1. Add is_disabled column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- 2. Create function to toggle user status
CREATE OR REPLACE FUNCTION toggle_user_status(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_status BOOLEAN;
BEGIN
    -- Only admins can toggle status
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can toggle user status';
    END IF;

    -- Get current status
    SELECT is_disabled INTO current_status
    FROM profiles
    WHERE id = target_user_id;

    -- Toggle
    UPDATE profiles
    SET is_disabled = NOT current_status
    WHERE id = target_user_id;

    RETURN NOT current_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update admin_stats view to include disabled users count
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM profiles WHERE is_disabled = true) as disabled_users,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE status = 'published') as published_products,
  (SELECT COUNT(*) FROM lead_submissions) as total_leads,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '24 hours') as leads_today,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '7 days') as leads_this_week,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '30 days') as leads_this_month;
