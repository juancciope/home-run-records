-- Multi-tenant schema for Artist OS
-- Supporting superadmin, artist managers (agency admins), and artists

-- Create custom types for user roles
CREATE TYPE user_role AS ENUM ('superadmin', 'artist_manager', 'artist');
CREATE TYPE agency_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE artist_status AS ENUM ('active', 'inactive', 'pending');

-- Agencies table (tenants)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    status agency_status DEFAULT 'active',
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
    max_artists INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with global roles
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    global_role user_role DEFAULT 'artist',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agency-User relationships (for multi-agency access)
CREATE TABLE agency_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL, -- Role within this specific agency
    is_primary BOOLEAN DEFAULT FALSE, -- Primary agency for this user
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, user_id)
);

-- Artists table (belongs to agencies)
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Linked user account (optional)
    stage_name VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    bio TEXT,
    genres TEXT[], -- Array of genres
    avatar_url TEXT,
    banner_url TEXT,
    status artist_status DEFAULT 'active',
    -- External platform IDs
    spotify_id VARCHAR(255),
    instagram_handle VARCHAR(100),
    tiktok_handle VARCHAR(100),
    youtube_channel_id VARCHAR(255),
    viberate_artist_id VARCHAR(255),
    -- Metrics (cached for performance)
    total_followers INTEGER DEFAULT 0,
    total_monthly_listeners INTEGER DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, stage_name)
);

-- Goals table (per artist)
CREATE TABLE artist_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- 'streams', 'followers', 'revenue', 'releases'
    target_value BIGINT NOT NULL,
    current_value BIGINT DEFAULT 0,
    timeframe VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members (per agency)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL, -- 'Manager', 'Producer', 'Marketing', etc.
    responsibilities TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks/todos (per agency)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE, -- Optional: artist-specific task
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'completed'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics data (per artist)
CREATE TABLE artist_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'spotify', 'instagram', 'tiktok', 'youtube'
    metric_type VARCHAR(50) NOT NULL, -- 'followers', 'streams', 'views', 'likes'
    value BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, date, platform, metric_type)
);

-- Indexes for performance
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_status ON agencies(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_global_role ON users(global_role);
CREATE INDEX idx_agency_users_agency ON agency_users(agency_id);
CREATE INDEX idx_agency_users_user ON agency_users(user_id);
CREATE INDEX idx_artists_agency ON artists(agency_id);
CREATE INDEX idx_artists_user ON artists(user_id);
CREATE INDEX idx_artists_status ON artists(status);
CREATE INDEX idx_artist_goals_artist ON artist_goals(artist_id);
CREATE INDEX idx_team_members_agency ON team_members(agency_id);
CREATE INDEX idx_tasks_agency ON tasks(agency_id);
CREATE INDEX idx_tasks_artist ON tasks(artist_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_analytics_artist_date ON artist_analytics(artist_id, date);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_analytics ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's global role
CREATE OR REPLACE FUNCTION get_user_global_role(user_uuid UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT global_role FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has access to agency
CREATE OR REPLACE FUNCTION user_has_agency_access(user_uuid UUID, agency_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Superadmins have access to all agencies
    IF get_user_global_role(user_uuid) = 'superadmin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is part of the agency
    RETURN EXISTS (
        SELECT 1 FROM agency_users 
        WHERE user_id = user_uuid AND agency_id = agency_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can manage agency
CREATE OR REPLACE FUNCTION user_can_manage_agency(user_uuid UUID, agency_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Superadmins can manage all agencies
    IF get_user_global_role(user_uuid) = 'superadmin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is an artist_manager in this agency
    RETURN EXISTS (
        SELECT 1 FROM agency_users 
        WHERE user_id = user_uuid 
        AND agency_id = agency_uuid 
        AND role = 'artist_manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for agencies
CREATE POLICY "Superadmins can view all agencies" ON agencies
    FOR SELECT USING (get_user_global_role(auth.uid()) = 'superadmin');

CREATE POLICY "Users can view their agencies" ON agencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agency_users 
            WHERE user_id = auth.uid() AND agency_id = id
        )
    );

CREATE POLICY "Superadmins can manage all agencies" ON agencies
    FOR ALL USING (get_user_global_role(auth.uid()) = 'superadmin');

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Superadmins can view all users" ON users
    FOR SELECT USING (get_user_global_role(auth.uid()) = 'superadmin');

CREATE POLICY "Artist managers can view users in their agencies" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agency_users au1
            JOIN agency_users au2 ON au1.agency_id = au2.agency_id
            WHERE au1.user_id = auth.uid() 
            AND au1.role = 'artist_manager'
            AND au2.user_id = users.id
        )
    );

-- RLS Policies for agency_users
CREATE POLICY "Users can view their own agency relationships" ON agency_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Superadmins can view all agency relationships" ON agency_users
    FOR SELECT USING (get_user_global_role(auth.uid()) = 'superadmin');

CREATE POLICY "Artist managers can view relationships in their agencies" ON agency_users
    FOR SELECT USING (
        user_has_agency_access(auth.uid(), agency_id) AND
        user_can_manage_agency(auth.uid(), agency_id)
    );

-- RLS Policies for artists
CREATE POLICY "Users can view artists in their agencies" ON artists
    FOR SELECT USING (user_has_agency_access(auth.uid(), agency_id));

CREATE POLICY "Artist managers can manage artists in their agencies" ON artists
    FOR ALL USING (user_can_manage_agency(auth.uid(), agency_id));

CREATE POLICY "Artists can view and edit their own profile" ON artists
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for artist_goals
CREATE POLICY "Users can view goals for artists in their agencies" ON artist_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM artists a
            WHERE a.id = artist_goals.artist_id
            AND user_has_agency_access(auth.uid(), a.agency_id)
        )
    );

CREATE POLICY "Artist managers can manage goals in their agencies" ON artist_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM artists a
            WHERE a.id = artist_goals.artist_id
            AND user_can_manage_agency(auth.uid(), a.agency_id)
        )
    );

CREATE POLICY "Artists can manage their own goals" ON artist_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM artists a
            WHERE a.id = artist_goals.artist_id
            AND a.user_id = auth.uid()
        )
    );

-- RLS Policies for team_members
CREATE POLICY "Users can view team members in their agencies" ON team_members
    FOR SELECT USING (user_has_agency_access(auth.uid(), agency_id));

CREATE POLICY "Artist managers can manage team in their agencies" ON team_members
    FOR ALL USING (user_can_manage_agency(auth.uid(), agency_id));

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their agencies" ON tasks
    FOR SELECT USING (user_has_agency_access(auth.uid(), agency_id));

CREATE POLICY "Artist managers can manage tasks in their agencies" ON tasks
    FOR ALL USING (user_can_manage_agency(auth.uid(), agency_id));

CREATE POLICY "Team members can update tasks assigned to them" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.id = tasks.assigned_to
            AND tm.user_id = auth.uid()
        )
    );

-- RLS Policies for artist_analytics
CREATE POLICY "Users can view analytics for artists in their agencies" ON artist_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM artists a
            WHERE a.id = artist_analytics.artist_id
            AND user_has_agency_access(auth.uid(), a.agency_id)
        )
    );

CREATE POLICY "Artist managers can manage analytics in their agencies" ON artist_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM artists a
            WHERE a.id = artist_analytics.artist_id
            AND user_can_manage_agency(auth.uid(), a.agency_id)
        )
    );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artist_goals_updated_at BEFORE UPDATE ON artist_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development
INSERT INTO agencies (name, slug, description, contact_email) VALUES
('Home Run Records', 'home-run-records', 'Independent music label and artist management', 'contact@homerunrecords.com'),
('Indie Wave Agency', 'indie-wave-agency', 'Boutique artist management for indie artists', 'hello@indiewave.com');

-- Sample superadmin user (will be created through auth)
-- This would be created when the superadmin signs up
-- INSERT INTO users (id, email, first_name, last_name, global_role) VALUES
-- ('superadmin-uuid-here', 'admin@artistos.com', 'Super', 'Admin', 'superadmin');

COMMENT ON TABLE agencies IS 'Tenant organizations managing artists';
COMMENT ON TABLE users IS 'All users in the system with global roles';
COMMENT ON TABLE agency_users IS 'User-agency relationships with agency-specific roles';
COMMENT ON TABLE artists IS 'Artist profiles belonging to agencies';
COMMENT ON TABLE artist_goals IS 'Goals and targets set for artists';
COMMENT ON TABLE team_members IS 'Team members working for agencies';
COMMENT ON TABLE tasks IS 'Tasks and todos for agency project management';
COMMENT ON TABLE artist_analytics IS 'Analytics data for artists across platforms';