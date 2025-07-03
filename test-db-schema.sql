-- Test script to check if is_member column exists in money_methods table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'money_methods' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if user_settings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_settings';

-- Check characters table for is_active and plat_tokens columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND table_schema = 'public'
AND column_name IN ('is_active', 'plat_tokens')
ORDER BY ordinal_position; 