-- Poker-waitless Database Schema for Supabase
-- Created based on アプリ仕様書 (1).md
-- All tables have Realtime enabled for instant synchronization

-- ============================================
-- 1. stores (店舗) テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location JSONB NOT NULL, -- { "lat": number, "lng": number }
  rates JSONB NOT NULL DEFAULT '[]', -- ["1/3", "2/5", "5/10"] etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. tables (卓状況) テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rate VARCHAR(50) NOT NULL, -- "1/3", "2/5" etc.
  max_seats INTEGER NOT NULL DEFAULT 9,
  current_players INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open' or 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_current_players CHECK (current_players >= 0 AND current_players <= max_seats),
  CONSTRAINT check_status CHECK (status IN ('open', 'closed'))
);

-- ============================================
-- 3. waitlist (ウェイティング) テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- LINE ID
  user_name VARCHAR(255) NOT NULL,
  rate_preference VARCHAR(50), -- "1/3", "2/5" etc.
  status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'called', 'seated', 'cancelled'
  called_at TIMESTAMP WITH TIME ZONE,
  arrival_estimation_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_status CHECK (status IN ('waiting', 'called', 'seated', 'cancelled'))
);

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX idx_tables_store_id ON tables(store_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_waitlist_store_id ON waitlist(store_id);
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_called_at ON waitlist(called_at);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (基本的なポリシー - 必要に応じて調整)
-- ============================================

-- stores: 全員が読み取り可能、認証ユーザーが更新可能
CREATE POLICY "Enable read access for all users" ON stores
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON stores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON stores
  FOR UPDATE USING (auth.role() = 'authenticated');

-- tables: 全員が読み取り可能、認証ユーザーが更新可能
CREATE POLICY "Enable read access for all users" ON tables
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tables
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tables
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tables
  FOR DELETE USING (auth.role() = 'authenticated');

-- waitlist: 全員が読み取り可能、認証ユーザーが更新可能
CREATE POLICY "Enable read access for all users" ON waitlist
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON waitlist
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON waitlist
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON waitlist
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Sample data (テスト用 - オプション)
-- ============================================

-- サンプル店舗データ
-- INSERT INTO stores (name, location, rates) VALUES
-- ('CTP Taipei', '{"lat": 25.0330, "lng": 121.5654}', '["1/3", "2/5", "5/10"]'),
-- ('Guild A', '{"lat": 25.0478, "lng": 121.5318}', '["1/2", "2/5"]');

-- サンプル卓データ
-- INSERT INTO tables (store_id, rate, max_seats, current_players, status) VALUES
-- ((SELECT id FROM stores WHERE name = 'CTP Taipei'), '1/3', 9, 6, 'open'),
-- ((SELECT id FROM stores WHERE name = 'CTP Taipei'), '2/5', 9, 8, 'open');
