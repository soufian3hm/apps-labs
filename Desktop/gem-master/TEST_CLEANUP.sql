-- OPTION 1: Run the standard cleanup (same as cron)
-- This deletes records older than 24 hours. 
-- Useful to verify the query works, but won't remove your fresh test orders.
DELETE FROM lead_ip_tracking 
WHERE created_at < now() - interval '24 hours';


-- OPTION 2: Force Reset (Unlock Everything)
-- Run this if you want to clear ALL tracking data and unlock yourself immediately.
-- DELETE FROM lead_ip_tracking;
