-- Function to prevent changing custom_domain if it's already set
CREATE OR REPLACE FUNCTION prevent_custom_domain_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the old value was not null and not empty, and if the new value is different
    IF OLD.custom_domain IS NOT NULL AND OLD.custom_domain != '' AND NEW.custom_domain IS DISTINCT FROM OLD.custom_domain THEN
        RAISE EXCEPTION 'Store URL (custom_domain) cannot be changed once set. Please contact support if you need to change it.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function before update on the stores table
CREATE TRIGGER lock_store_url
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION prevent_custom_domain_change();
