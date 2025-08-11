-- Fixed Sample Data for Artist OS Multi-Tenant Setup
-- Run this AFTER applying the multi-tenant-schema.sql

-- Insert sample agencies
INSERT INTO agencies (id, name, slug, description, contact_email, website_url, status, subscription_tier, max_artists) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Home Run Records', 'home-run-records', 'Independent music label and artist management company specializing in emerging talent', 'contact@homerunrecords.com', 'https://homerunrecords.com', 'active', 'premium', 50),
('550e8400-e29b-41d4-a716-446655440002', 'Indie Wave Agency', 'indie-wave-agency', 'Boutique artist management for indie and alternative artists', 'hello@indiewave.com', 'https://indiewave.com', 'active', 'basic', 25),
('550e8400-e29b-41d4-a716-446655440003', 'Urban Beats Management', 'urban-beats', 'Hip-hop and R&B artist management with focus on digital marketing', 'info@urbanbeats.com', 'https://urbanbeats.com', 'active', 'enterprise', 100),
('550e8400-e29b-41d4-a716-446655440004', 'Acoustic Dreams', 'acoustic-dreams', 'Folk and acoustic artist collective', 'team@acousticdreams.com', 'https://acousticdreams.com', 'active', 'basic', 15);

-- Insert sample artists for Home Run Records
INSERT INTO artists (id, agency_id, stage_name, real_name, bio, genres, status, total_followers, total_monthly_listeners, total_streams, spotify_id, instagram_handle, tiktok_handle) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Alex Rivera', 'Alexander Rivera', 'Rising pop-electronic artist with a passion for innovative soundscapes and emotional storytelling.', ARRAY['Pop', 'Electronic', 'Synthwave'], 'active', 45000, 25000, 1250000, 'alexrivera_music', 'alexrivera.music', 'alexriveramusic'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Maya Chen', 'Maya Chen', 'Indie folk singer-songwriter known for her introspective lyrics and ethereal vocals.', ARRAY['Indie', 'Folk', 'Singer-Songwriter'], 'active', 32000, 18000, 890000, 'mayachen_official', 'maya.chen.music', 'mayachenfolk'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'The Midnight Collective', 'Various Artists', 'Electronic music collective producing atmospheric and cinematic soundtracks.', ARRAY['Electronic', 'Ambient', 'Cinematic'], 'active', 67000, 42000, 2100000, 'midnightcollective', 'midnight.collective', 'midnightcollectivemusic');

-- Insert sample artists for Indie Wave Agency
INSERT INTO artists (id, agency_id, stage_name, real_name, bio, genres, status, total_followers, total_monthly_listeners, total_streams, spotify_id, instagram_handle) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Luna Martinez', 'Luna Sofia Martinez', 'Bilingual indie pop artist blending English and Spanish influences with dreamy melodies.', ARRAY['Indie Pop', 'Dream Pop', 'Alternative'], 'active', 28000, 16000, 720000, 'lunamartinez_music', 'luna.martinez.official'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Echo Valley', 'James Thompson & Sarah Williams', 'Indie rock duo creating anthemic songs about love, loss, and small-town dreams.', ARRAY['Indie Rock', 'Alternative Rock', 'Americana'], 'active', 51000, 29000, 1450000, 'echovalleyband', 'echovalleymusic');

-- Insert sample artists for Urban Beats Management  
INSERT INTO artists (id, agency_id, stage_name, real_name, bio, genres, status, total_followers, total_monthly_listeners, total_streams, spotify_id, instagram_handle, tiktok_handle) VALUES
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'DJ Neon', 'Marcus Johnson', 'House and electronic music producer with over 10 years of experience in the underground scene.', ARRAY['Electronic', 'House', 'Techno'], 'active', 78000, 45000, 2800000, 'djneon_official', 'dj.neon.official', 'djneonbeats'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Rhythm & Soul', 'Destiny Washington', 'R&B vocalist and songwriter bringing classic soul vibes to modern audiences.', ARRAY['R&B', 'Soul', 'Neo-Soul'], 'active', 92000, 55000, 3200000, 'rhythmandsoul_music', 'rhythm.and.soul', 'rhythmsoulmusic'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'K-Wave', 'Kevin Park', 'Hip-hop artist and producer influenced by both Korean and American rap cultures.', ARRAY['Hip-Hop', 'Rap', 'K-Hip-Hop'], 'active', 63000, 38000, 1900000, 'kwavemusic', 'k.wave.official', 'kwavehiphop');

-- Insert sample artists for Acoustic Dreams
INSERT INTO artists (id, agency_id, stage_name, real_name, bio, genres, status, total_followers, total_monthly_listeners, total_streams, spotify_id, instagram_handle) VALUES
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Willow & Pine', 'Emma Richardson', 'Acoustic folk artist creating intimate songs inspired by nature and personal growth.', ARRAY['Folk', 'Acoustic', 'Singer-Songwriter'], 'active', 21000, 12000, 480000, 'willowandpine_music', 'willow.and.pine'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'Mountain Echo', 'David & Lisa Coleman', 'Husband and wife duo performing traditional and contemporary folk music.', ARRAY['Folk', 'Americana', 'Traditional'], 'active', 18000, 9000, 350000, 'mountainecho_duo', 'mountain.echo.music');

-- Insert sample goals for artists
INSERT INTO artist_goals (artist_id, goal_type, target_value, current_value, timeframe, start_date, end_date) VALUES
-- Alex Rivera goals
('660e8400-e29b-41d4-a716-446655440001', 'followers', 75000, 45000, 'yearly', '2024-01-01', '2024-12-31'),
('660e8400-e29b-41d4-a716-446655440001', 'streams', 50000, 25000, 'monthly', '2024-12-01', '2024-12-31'),

-- Maya Chen goals  
('660e8400-e29b-41d4-a716-446655440002', 'followers', 50000, 32000, 'yearly', '2024-01-01', '2024-12-31'),
('660e8400-e29b-41d4-a716-446655440002', 'releases', 8, 3, 'yearly', '2024-01-01', '2024-12-31'),

-- DJ Neon goals
('660e8400-e29b-41d4-a716-446655440006', 'streams', 75000, 45000, 'monthly', '2024-12-01', '2024-12-31'),
('660e8400-e29b-41d4-a716-446655440006', 'followers', 100000, 78000, 'yearly', '2024-01-01', '2024-12-31');

-- Insert sample team members for Home Run Records (simplified - no user references)
INSERT INTO team_members (agency_id, name, email, phone, role, responsibilities, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@homerunrecords.com', '+1-555-0123', 'General Manager', ARRAY['Artist Relations', 'Strategic Planning', 'Business Development'], 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Mike Rodriguez', 'mike@homerunrecords.com', '+1-555-0124', 'Producer', ARRAY['Music Production', 'Recording', 'Mixing & Mastering'], 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Jessica Wong', 'jessica@homerunrecords.com', '+1-555-0125', 'Marketing Director', ARRAY['Social Media', 'PR Campaigns', 'Brand Strategy'], 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Carlos Martinez', 'carlos@homerunrecords.com', '+1-555-0126', 'A&R Scout', ARRAY['Talent Scouting', 'Artist Development', 'Industry Relations'], 'active');

-- Insert sample team members for Indie Wave Agency  
INSERT INTO team_members (agency_id, name, email, phone, role, responsibilities, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Amanda Foster', 'amanda@indiewave.com', '+1-555-0127', 'Founder & Manager', ARRAY['Artist Management', 'Label Relations', 'Tour Booking'], 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Ryan Kim', 'ryan@indiewave.com', '+1-555-0128', 'Creative Director', ARRAY['Visual Content', 'Music Videos', 'Brand Design'], 'active');

-- Insert simple tasks (no user references to avoid foreign key issues)
INSERT INTO tasks (agency_id, artist_id, title, description, status, priority, due_date) VALUES
-- Home Run Records tasks
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Finish new single recording', 'Complete vocals and final mix for "Electric Dreams" release', 'in_progress', 'high', '2024-12-20'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Social media campaign for new EP', 'Create content calendar and promotional materials for Maya''s upcoming EP', 'todo', 'medium', '2024-12-15'),
('550e8400-e29b-41d4-a716-446655440001', NULL, 'Q1 artist showcase planning', 'Plan and coordinate showcase event for label artists', 'todo', 'medium', '2025-01-30'),

-- Indie Wave Agency tasks
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Luna Martinez album artwork', 'Design album cover and promotional materials for upcoming release', 'todo', 'medium', '2024-12-18'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'Echo Valley tour planning', 'Coordinate spring tour dates and venue bookings', 'in_progress', 'high', '2025-01-15'),

-- Urban Beats Management tasks
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', 'DJ Neon remix collaboration', 'Coordinate remix project with featured artist', 'todo', 'medium', '2024-12-25'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'Rhythm & Soul music video', 'Produce and edit music video for latest single', 'in_progress', 'high', '2024-12-22');

-- Insert some sample analytics data (last 30 days)
INSERT INTO artist_analytics (artist_id, date, platform, metric_type, value) VALUES
-- Alex Rivera analytics
('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'streams', 1250),
('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'followers', 45000),
('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'instagram', 'followers', 23000),
('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'tiktok', 'followers', 15000),

-- Maya Chen analytics  
('660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'streams', 890),
('660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'followers', 32000),
('660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 'instagram', 'followers', 18000),

-- DJ Neon analytics
('660e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'streams', 2100),
('660e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'followers', 78000),
('660e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 'instagram', 'followers', 45000),
('660e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 'tiktok', 'followers', 52000),

-- Luna Martinez analytics
('660e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'streams', 680),
('660e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'followers', 28000),
('660e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 'instagram', 'followers', 19000),

-- Rhythm & Soul analytics
('660e8400-e29b-41d4-a716-446655440007', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'streams', 1850),
('660e8400-e29b-41d4-a716-446655440007', CURRENT_DATE - INTERVAL '1 day', 'spotify', 'followers', 92000),
('660e8400-e29b-41d4-a716-446655440007', CURRENT_DATE - INTERVAL '1 day', 'instagram', 'followers', 67000),
('660e8400-e29b-41d4-a716-446655440007', CURRENT_DATE - INTERVAL '1 day', 'tiktok', 'followers', 83000);

-- Success message
SELECT 'Sample data inserted successfully!' as message,
       (SELECT COUNT(*) FROM agencies) as agencies_created,
       (SELECT COUNT(*) FROM artists) as artists_created,
       (SELECT COUNT(*) FROM team_members) as team_members_created,
       (SELECT COUNT(*) FROM tasks) as tasks_created,
       (SELECT COUNT(*) FROM artist_goals) as goals_created,
       (SELECT COUNT(*) FROM artist_analytics) as analytics_records;