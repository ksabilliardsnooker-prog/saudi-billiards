-- =====================================================
-- Saudi Billiards Platform - Database Schema v14
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('player', 'coach', 'club', 'moderator', 'super_admin')),
  account_status TEXT NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'under_review', 'returned', 'approved', 'active', 'rejected', 'suspended')),
  first_name TEXT,
  last_name TEXT,
  club_name TEXT,
  birth_date DATE,
  city TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_snapchat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. COACHES INFO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coaches_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT CHECK (specialization IN ('billiards', 'snooker', 'both')),
  experience_years INTEGER DEFAULT 0,
  certificates TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  available_days TEXT[] DEFAULT '{}',
  available_hours TEXT,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CLUBS INFO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clubs_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  logo_url TEXT,
  commercial_registration TEXT,
  work_license TEXT,
  address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  billiard_tables INTEGER DEFAULT 0,
  snooker_tables INTEGER DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  working_hours TEXT,
  photos TEXT[] DEFAULT '{}',
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. VERIFICATION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_type TEXT NOT NULL CHECK (member_type IN ('coach', 'club')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'returned', 'approved', 'rejected')),
  documents TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  return_reason TEXT,
  return_notes TEXT,
  rejection_reason TEXT,
  resubmitted_at TIMESTAMPTZ,
  resubmit_count INTEGER DEFAULT 0
);

-- =====================================================
-- 5. ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'moderator')),
  permissions TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 6. MARKETPLACE ADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('tables', 'cues', 'shafts', 'accessories')),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'used')),
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TOURNAMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL CHECK (game_type IN ('billiards', 'snooker')),
  play_system TEXT NOT NULL CHECK (play_system IN ('8ball', '9ball', '10ball')),
  tournament_system TEXT NOT NULL CHECK (tournament_system IN ('single', 'double')),
  participation_type TEXT NOT NULL CHECK (participation_type IN ('individual', 'team')),
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  entry_fee DECIMAL(10,2),
  prize_first TEXT NOT NULL,
  prize_second TEXT NOT NULL,
  prize_third TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled')),
  winner_first UUID REFERENCES users(id),
  winner_second UUID REFERENCES users(id),
  winner_third UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TOURNAMENT REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_name TEXT,
  team_members JSONB,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
  UNIQUE(tournament_id, user_id)
);

-- =====================================================
-- 9. TOURNAMENT MATCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  bracket TEXT NOT NULL CHECK (bracket IN ('winners', 'losers', 'final')),
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  winner_id UUID REFERENCES users(id),
  score_player1 INTEGER,
  score_player2 INTEGER,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10,2) NOT NULL,
  duration_hours INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. COURSE REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'completed')),
  UNIQUE(course_id, user_id)
);

-- =====================================================
-- 12. CLUB OFFERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS club_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  new_price DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. NEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('federation', 'tournaments', 'general')),
  image_url TEXT,
  source TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- =====================================================
-- 14. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_type TEXT NOT NULL CHECK (reviewed_type IN ('club', 'coach')),
  reviewed_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_type, reviewed_id)
);

-- =====================================================
-- 15. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Marketplace policies
CREATE POLICY "Anyone can view active ads" ON marketplace_ads FOR SELECT USING (status = 'active');
CREATE POLICY "Users can insert own ads" ON marketplace_ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ads" ON marketplace_ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ads" ON marketplace_ads FOR DELETE USING (auth.uid() = user_id);

-- Tournaments policies
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Clubs can insert tournaments" ON tournaments FOR INSERT WITH CHECK (auth.uid() = club_id);
CREATE POLICY "Clubs can update own tournaments" ON tournaments FOR UPDATE USING (auth.uid() = club_id);

-- Tournament registrations policies
CREATE POLICY "Anyone can view registrations" ON tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register" ON tournament_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registration" ON tournament_registrations FOR UPDATE USING (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Coaches can insert courses" ON courses FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update own courses" ON courses FOR UPDATE USING (auth.uid() = coach_id);

-- Course registrations policies
CREATE POLICY "Anyone can view course registrations" ON course_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register for courses" ON course_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Club offers policies
CREATE POLICY "Anyone can view active offers" ON club_offers FOR SELECT USING (status = 'active');
CREATE POLICY "Clubs can insert offers" ON club_offers FOR INSERT WITH CHECK (auth.uid() = club_id);
CREATE POLICY "Clubs can update own offers" ON club_offers FOR UPDATE USING (auth.uid() = club_id);

-- News policies
CREATE POLICY "Anyone can view published news" ON news FOR SELECT USING (status = 'published');

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, phone, member_type, account_status, first_name, last_name, club_name, birth_date, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'member_type', 'player'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'member_type' = 'player' THEN 'active'
      ELSE 'pending'
    END,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'club_name',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'city', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_ads_updated_at BEFORE UPDATE ON marketplace_ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- You can add initial super admin after deployment by running:
-- UPDATE users SET member_type = 'super_admin', account_status = 'active' WHERE email = 'your-email@example.com';
-- INSERT INTO admins (user_id, role, permissions) SELECT id, 'super_admin', ARRAY['*'] FROM users WHERE email = 'your-email@example.com';
