# TPDS Player App（LINEミニアプリ）

台湾ポーカー・ドミナント・システム（TPDS）のPlayer側アプリ（エンドユーザー向けLINEミニアプリ）

## 🎯 現在の実装状況

### ✅ Week 1 完了（基盤構築）
- [x] Next.js 16 + React 19 + TypeScript セットアップ
- [x] Tailwind CSS 4 統合
- [x] Supabase 接続（既存Admin DBと連携）
- [x] 多言語対応（日本語・中国語・英語）
- [x] モックモード実装

### ✅ Week 2 完了（MAP画面＆リアルタイム機能）
- [x] Google Maps 統合（@vis.gl/react-google-maps）
- [x] 店舗マーカー表示（信号機ロジック 🟢🟡🔴）
- [x] Supabase Realtime 購読
- [x] リアルタイム信号機更新
- [x] リアルタイム待ち順更新

### ⏳ Week 3 予定（チェックイン機能）
- [ ] チェックイン処理の最適化
- [ ] エラーハンドリング強化
- [ ] UI/UXポリッシュ

### ⏳ Week 4 予定（LINE通知＆最適化）
- [ ] LIFF 統合（LINE認証）
- [ ] LINE通知（Database Trigger + Edge Function）
- [ ] パフォーマンス最適化

---

## 🚀 クイックスタート

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルを作成（既に設定済み）:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fngidetbkheuvftavbbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2mEnbms81V_elKPGRXCt-w_IeVym8Wh
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAtjbeqX9SslMkDZRO875mj4OhlnXP6xyU
NEXT_PUBLIC_USE_MOCK_MODE=true
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:3001` を開く

---

## 📱 実装済み画面

### 1. MAP画面 (`/map`)
- Google Maps上に店舗ピンを表示
- 信号機ロジック（🟢緑=空席あり / 🟡黄=少し待ち / 🔴赤=混雑中）
- 店舗検索バー
- レートフィルター（1/3, 2/5, 5/10+, すべて）
- **リアルタイム更新**：Admin側で卓状況が変わると即座に信号機が更新

### 2. 店舗詳細＆チェックイン画面 (`/store/[storeId]`)
- 店舗情報表示（名前、住所、営業時間）
- レート選択ボタン
- 到着時間選択（15分後、30分後、45分後、1時間後）
- 待ち人数のリアルタイム表示
- チェックインボタン
- **リアルタイム更新**：Admin側でウェイティングリストが変わると待ち人数が自動更新

### 3. マイステータス画面 (`/status/[waitlistId]`)
- 現在の待ち順位を大きく表示
- 呼び出し予測時刻
- LINE通知ステータス
- キャンセルボタン
- **リアルタイム更新**：自分の順位が変わると即座に更新

### 4. 使い方ガイド (`/guide`)
- アプリの使い方説明
- 信号機の見方解説

---

## 🏗️ プロジェクト構成

```
player-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # グローバルレイアウト（LIFF初期化）
│   ├── page.tsx           # ルートページ（/map へリダイレクト）
│   ├── map/               # MAP画面
│   ├── store/[storeId]/   # 店舗詳細画面
│   ├── status/[waitlistId]/ # マイステータス画面
│   └── guide/             # 使い方ガイド
├── components/
│   ├── map/               # MAP関連コンポーネント
│   │   ├── MapView.tsx   # Google Maps表示
│   │   └── StoreCard.tsx # 店舗カード
│   └── ...
├── hooks/
│   ├── useRealtimeStores.ts     # 全店舗リアルタイム購読
│   ├── useRealtimeStore.ts      # 特定店舗リアルタイム購読
│   └── useMyWaitlistEntry.ts    # 自分のエントリ購読
├── lib/
│   ├── types.ts           # 型定義
│   ├── supabase.ts        # Supabase接続
│   ├── storeStatus.ts     # 信号機ロジック
│   └── mock/              # モックデータ
├── messages/              # 多言語ファイル
│   ├── ja.json
│   ├── zh-TW.json
│   └── en.json
└── .env.local             # 環境変数
```

---

## 🎨 信号機ロジック

店舗の混雑状況を3色で可視化：

```typescript
if (availableSeats > 0) {
  return 'green'  // 🟢 空席あり（すぐ座れる）
} else if (waitingCount <= 3) {
  return 'yellow' // 🟡 少し待ち（3人以内の待ち）
} else {
  return 'red'    // 🔴 混雑中（4人以上待ち）
}
```

---

## 🔄 リアルタイム機能

### Supabase Realtime を使った双方向同期

**Admin側（iPad）→ Player側（スマホ）**
- Admin側で卓状況を更新 → Player側のMAP画面の信号機が自動更新
- Admin側で呼び出しボタン → Player側のステータス画面に通知

**実装パターン：**
```typescript
const channel = supabase
  .channel(`waitlist-${storeId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'waitlist',
    filter: `store_id=eq.${storeId}`,
  }, (payload) => {
    // リアルタイム更新処理
  })
  .subscribe()
```

---

## 🌐 多言語対応

next-intl を使用して3言語対応：

- 🇯🇵 日本語（ja）
- 🇹🇼 中国語繁体字（zh-TW）- デフォルト
- 🇬🇧 英語（en）

翻訳ファイル：`messages/ja.json`, `messages/zh-TW.json`, `messages/en.json`

---

## 🔧 モックモード vs 本番モード

### モックモード（現在）
- `NEXT_PUBLIC_USE_MOCK_MODE=true`
- モックデータを使用（`lib/mock/data.ts`）
- LIFF統合なし
- Supabase接続なし

### 本番モード
- `NEXT_PUBLIC_USE_MOCK_MODE=false`
- Supabase Realtimeで実際のデータを購読
- LIFF統合（LINE認証）
- 実際のチェックイン・キャンセル処理

---

## 📝 次のステップ

### 即座にできること
1. **動作確認**: `http://localhost:3001` でアプリをテスト
2. **Google Maps確認**: 実際の台北市の地図上に店舗ピンが表示されることを確認
3. **リアルタイム機能確認**: Admin側（iPad）でデータを変更してPlayer側が更新されるか確認

### LINE統合の準備
LINE開発者情報が揃ったら：
- LIFF ID を `.env.local` に追加
- `NEXT_PUBLIC_USE_MOCK_MODE=false` に変更
- LIFF統合コードを実装

---

## 🐛 トラブルシューティング

### Google Mapsが表示されない
→ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` が正しく設定されているか確認

### リアルタイム更新が動作しない
→ Supabase Realtimeが有効化されているか確認（Database → Replication）

### モックモードから本番モードへの切り替え
→ `.env.local` の `NEXT_PUBLIC_USE_MOCK_MODE` を `false` に変更

---

**開発者**: Claude Code
**バージョン**: 1.0
**最終更新**: 2026-02-11
