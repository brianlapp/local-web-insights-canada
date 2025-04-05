-- Create admin user (password is "admin123" - change in production!)
INSERT INTO users (email, password, first_name, last_name, role)
VALUES (
    'admin@localwebinsights.ca',
    '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9IyLHvUdSWBj9m', -- hashed password
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create API key for system use
INSERT INTO api_keys (name, key, permissions, created_at, expires_at)
VALUES (
    'System API Key',
    '0b5c9e3a7f2d1b6e8a4c0f5d2e7b9a3c6', -- example key, replace in production
    ARRAY['business.read', 'business.write', 'analysis.read', 'analysis.write', 'webhook.read', 'webhook.write'],
    NOW(),
    NOW() + INTERVAL '1 year'
) ON CONFLICT (key) DO NOTHING; 