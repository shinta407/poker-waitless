-- ============================================
-- Supabase Seed Data for Poker Waitless
-- ============================================
--
-- Run this file in Supabase SQL Editor to populate initial data
--

-- サンプル店舗データ
-- 既存データがあればスキップ
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM stores WHERE name = 'CTP Taipei') THEN
    INSERT INTO stores (name, location, rates) VALUES
    ('CTP Taipei', '{"lat": 25.0330, "lng": 121.5654}', '["1/3", "2/5", "5/10"]');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM stores WHERE name = 'Guild A') THEN
    INSERT INTO stores (name, location, rates) VALUES
    ('Guild A', '{"lat": 25.0478, "lng": 121.5318}', '["1/2", "2/5"]');
  END IF;
END $$;

-- サンプル卓データ
DO $$
DECLARE
  ctp_store_id UUID;
BEGIN
  SELECT id INTO ctp_store_id FROM stores WHERE name = 'CTP Taipei';

  IF ctp_store_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM tables WHERE store_id = ctp_store_id AND rate = '1/3'
  ) THEN
    INSERT INTO tables (store_id, rate, max_seats, current_players, status) VALUES
    (ctp_store_id, '1/3', 9, 6, 'open');
  END IF;

  IF ctp_store_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM tables WHERE store_id = ctp_store_id AND rate = '2/5'
  ) THEN
    INSERT INTO tables (store_id, rate, max_seats, current_players, status) VALUES
    (ctp_store_id, '2/5', 9, 8, 'open');
  END IF;
END $$;

-- 確認
SELECT 'Stores created:' as info, COUNT(*) as count FROM stores;
SELECT 'Tables created:' as info, COUNT(*) as count FROM tables;
