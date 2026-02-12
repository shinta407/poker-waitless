# Supabase データベースセットアップ手順

このドキュメントでは、Poker-waitlessアプリのSupabaseデータベースを作成する手順を説明します。

## 📋 前提条件

- Supabaseアカウント（無料プランでOK）
- プロジェクトの作成が完了していること

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `poker-waitless`（任意）
   - **Database Password**: 強力なパスワードを設定（必ず保存してください）
   - **Region**: `Northeast Asia (Tokyo)`を推奨
4. 「Create new project」をクリック（セットアップに2-3分かかります）

### 2. データベーススキーマの作成

1. Supabaseダッシュボードで、左サイドバーの「SQL Editor」をクリック
2. 「+ New query」をクリック
3. `supabase-schema.sql`ファイルの内容をコピー＆ペースト
4. 右上の「Run」ボタンをクリック
5. 「Success. No rows returned」と表示されれば成功です

### 3. Realtimeの有効化 ⚡

**重要**: リアルタイム同期のために、各テーブルでRealtimeを有効化する必要があります。

1. 左サイドバーの「Database」→「Replication」をクリック
2. 以下の3つのテーブルにチェックを入れる：
   - ✅ `stores`
   - ✅ `tables`
   - ✅ `waitlist`
3. 各テーブルの「Insert」「Update」「Delete」のイベントがすべて有効になっていることを確認

### 4. APIキーの取得

1. 左サイドバーの「Settings」→「API」をクリック
2. 以下の情報をコピーして保存：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（長い文字列）
   - **service_role key**: `eyJhbGc...`（管理用、慎重に扱う）

### 5. 環境変数の設定

アプリケーションで以下の環境変数を設定してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # サーバーサイドのみ
```

## 📊 データベース構造

### stores（店舗）テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | プライマリキー |
| name | VARCHAR(255) | 店舗名 |
| location | JSONB | 位置情報 `{"lat": 25.033, "lng": 121.565}` |
| rates | JSONB | レート情報 `["1/3", "2/5", "5/10"]` |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### tables（卓状況）テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | プライマリキー |
| store_id | UUID | 店舗ID（外部キー） |
| rate | VARCHAR(50) | レート（"1/3", "2/5"など） |
| max_seats | INTEGER | 最大座席数（デフォルト: 9） |
| current_players | INTEGER | 現在のプレイヤー数 |
| status | VARCHAR(20) | ステータス（'open' or 'closed'） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### waitlist（ウェイティング）テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | プライマリキー |
| store_id | UUID | 店舗ID（外部キー） |
| user_id | VARCHAR(255) | ユーザーID（LINE ID） |
| user_name | VARCHAR(255) | ユーザー名 |
| rate_preference | VARCHAR(50) | 希望レート |
| status | VARCHAR(20) | ステータス（'waiting', 'called', 'seated', 'cancelled'） |
| called_at | TIMESTAMP | 呼び出し時刻 |
| arrival_estimation_minutes | INTEGER | 到着予定時間（分） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

## 🧪 動作確認

### テストデータの挿入

SQL Editorで以下のクエリを実行してテストデータを挿入できます：

```sql
-- 店舗の追加
INSERT INTO stores (name, location, rates) VALUES
('CTP Taipei', '{"lat": 25.0330, "lng": 121.5654}', '["1/3", "2/5", "5/10"]'),
('Guild A', '{"lat": 25.0478, "lng": 121.5318}', '["1/2", "2/5"]');

-- 卓の追加
INSERT INTO tables (store_id, rate, max_seats, current_players, status)
SELECT id, '1/3', 9, 6, 'open' FROM stores WHERE name = 'CTP Taipei'
UNION ALL
SELECT id, '2/5', 9, 8, 'open' FROM stores WHERE name = 'CTP Taipei';

-- ウェイティングリストの追加
INSERT INTO waitlist (store_id, user_id, user_name, rate_preference, status)
SELECT id, 'U1234567890abcdef', '山田太郎', '1/3', 'waiting' FROM stores WHERE name = 'CTP Taipei';
```

### データの確認

1. 左サイドバーの「Table Editor」をクリック
2. 各テーブル（stores, tables, waitlist）を選択してデータを確認

## 🔐 セキュリティ設定

Row Level Security (RLS)が有効になっています：

- **読み取り**: 全てのユーザーが可能
- **書き込み**: 認証済みユーザーのみ可能

本番環境では、より細かいセキュリティポリシーの設定を検討してください。

## 📱 Realtime購読の実装例

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// tablesテーブルの変更を監視
const channel = supabase
  .channel('tables-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE すべて
      schema: 'public',
      table: 'tables'
    },
    (payload) => {
      console.log('テーブルが更新されました:', payload)
      // UIを更新する処理
    }
  )
  .subscribe()

// waitlistテーブルの変更を監視
const waitlistChannel = supabase
  .channel('waitlist-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'waitlist'
    },
    (payload) => {
      console.log('ウェイティングリストが更新されました:', payload)
      // UIを更新する処理
    }
  )
  .subscribe()
```

## 🎯 次のステップ

1. ✅ データベーススキーマの作成
2. ✅ Realtimeの有効化
3. ⬜ フロントエンド（LIFF）の開発
4. ⬜ 店舗用iPad画面の開発
5. ⬜ LINE Messaging API連携
6. ⬜ Edge Functionsの作成（通知機能）

## 💡 トラブルシューティング

### Realtimeが動作しない場合
- Database → Replicationで、該当テーブルのRealtimeが有効になっているか確認
- ブラウザのコンソールでWebSocketエラーが出ていないか確認
- APIキーが正しく設定されているか確認

### RLSエラーが出る場合
- 認証が正しく行われているか確認
- 開発中は一時的にRLSポリシーを緩和することも検討

## 📞 サポート

問題が発生した場合は、[Supabase公式ドキュメント](https://supabase.com/docs)を参照してください。

---

**作成者**: Based on アプリ仕様書 (1).md
**最終更新**: 2026-02-11
