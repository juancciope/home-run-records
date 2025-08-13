-- Debug query to check fan engagement records
SELECT 
    id,
    user_id,
    record_type,
    engagement_level,
    source,
    contact_info,
    created_at
FROM fan_engagement_records 
ORDER BY created_at DESC 
LIMIT 10;

-- Count by engagement level
SELECT 
    engagement_level,
    COUNT(*) as count
FROM fan_engagement_records 
GROUP BY engagement_level;

-- Count by record type
SELECT 
    record_type,
    COUNT(*) as count
FROM fan_engagement_records 
GROUP BY record_type;