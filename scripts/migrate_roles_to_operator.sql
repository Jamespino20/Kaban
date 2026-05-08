-- Migration Script: Convert legacy roles to 'operator' role
-- Run this SQL to migrate all existing admin and lender users to the new operator role

-- Convert all admin users to operator
UPDATE users 
SET role = 'operator' 
WHERE role = 'admin';

-- Convert all lender users to operator
UPDATE users 
SET role = 'operator' 
WHERE role = 'lender';

-- Verify the migration
SELECT role, COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;